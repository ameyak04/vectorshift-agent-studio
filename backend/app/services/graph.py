import os
import re
import json
import asyncio
import time
from typing import List, Dict, Any, AsyncGenerator

from app.models.pipeline import Edge
from app.services.agent import run_agent, execute_tool_logic
from app.services.llm import call_llm, DEFAULT_MODEL
from dotenv import load_dotenv

load_dotenv()

def topological_sort(node_ids: List[str], edges: List[Edge]) -> List[str]:
    valid = set(node_ids)
    adjacency: Dict[str, List[str]] = {nid: [] for nid in valid}
    in_degree: Dict[str, int] = {nid: 0 for nid in valid}

    for edge in edges:
        if edge.source in valid and edge.target in valid:
            # Skip edges that go into agent-tools since tools are executed by the agent, not the DAG
            if edge.targetHandle and edge.targetHandle.endswith("-tools"):
                continue
            adjacency[edge.source].append(edge.target)
            in_degree[edge.target] += 1

    queue = [nid for nid, deg in in_degree.items() if deg == 0]
    result = []

    while queue:
        current = queue.pop()
        result.append(current)
        for neighbor in adjacency[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(result) == len(valid):
        return result
    return []

def is_dag(node_ids: List[str], edges: List[Edge]) -> bool:
    return len(topological_sort(node_ids, edges)) == len(set(node_ids))

async def execute_pipeline(nodes: List[Dict[str, Any]], edges: List[Edge]) -> AsyncGenerator[str, None]:
    node_ids = [n.get('id') for n in nodes if n.get('id')]
    sorted_ids = topological_sort(node_ids, edges)
    
    summary_data = {
        "type": "summary",
        "num_nodes": len(nodes),
        "num_edges": len(edges),
        "is_dag": is_dag(node_ids, edges)
    }
    yield f"data: {json.dumps(summary_data)}\n\n"
    
    if not sorted_ids:
        yield f"data: {json.dumps({'type': 'error', 'message': 'Cycle detected'})}\n\n"
        return
        
    node_map = {n['id']: n for n in nodes if 'id' in n}
    handle_values = {}
    
    for nid in sorted_ids:
        node = node_map[nid]
        node_type = node.get('type')
        node_data = node.get('data', {})
        
        # Tool nodes are executed dynamically by the agent, skip them in DAG execution
        if node_type == 'tool':
            continue
            
        t_start = time.time()
        yield f"data: {json.dumps({'type': 'node_start', 'node_id': nid, 't': 0})}\n\n"
        await asyncio.sleep(0.5) 
        
        # Gather inputs for this node
        node_inputs = {}
        for edge in edges:
            if edge.target == nid:
                val = handle_values.get(edge.sourceHandle, "")
                node_inputs[edge.targetHandle] = val
                
        output = None
        
        if node_type == 'customInput':
            name = node_data.get('inputName', 'default_input')
            output = node_data.get('inputValue', '')
            handle_values[f"{nid}-value"] = output
            
        elif node_type == 'text':
            text = node_data.get('text', '')
            def replace_var(match):
                var_name = match.group(1)
                handle_id = f"{nid}-var-{var_name}"
                return str(node_inputs.get(handle_id, f"{{{{{var_name}}}}}"))
                
            output = re.sub(r'\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}', replace_var, text)
            handle_values[f"{nid}-output"] = output
            
        elif node_type == 'math':
            args = {
                'expression': f"{node_inputs.get(f'{nid}-a', '0')} {node_data.get('operation', '+')} {node_inputs.get(f'{nid}-b', '0')}"
            }
            if node_data.get('operation') == 'add': args['expression'] = f"{node_inputs.get(f'{nid}-a', '0')} + {node_inputs.get(f'{nid}-b', '0')}"
            elif node_data.get('operation') == 'subtract': args['expression'] = f"{node_inputs.get(f'{nid}-a', '0')} - {node_inputs.get(f'{nid}-b', '0')}"
            elif node_data.get('operation') == 'multiply': args['expression'] = f"{node_inputs.get(f'{nid}-a', '0')} * {node_inputs.get(f'{nid}-b', '0')}"
            elif node_data.get('operation') == 'divide': args['expression'] = f"{node_inputs.get(f'{nid}-a', '0')} / ({node_inputs.get(f'{nid}-b', '1')})"
            
            output = execute_tool_logic('calculator', args)
            handle_values[f"{nid}-result"] = output
            
        elif node_type == 'webSearch':
            query = node_inputs.get(f"{nid}-query", "")
            output = execute_tool_logic('web_search', {'query': query})
            handle_values[f"{nid}-results"] = output

        elif node_type == 'markdownOutput':
            output = node_inputs.get(f"{nid}-input", "No input received")
            handle_values[f"{nid}-output"] = output

        elif node_type == 'llm':
            # System priority: wired input > node config override > default.
            sys_prompt = node_inputs.get(f"{nid}-system") or node_data.get('system') or "You are a helpful assistant."
            user_prompt = node_inputs.get(f"{nid}-prompt", "")
            model_id = node_data.get('model', DEFAULT_MODEL)
            try:
                temperature = float(node_data.get('temperature', 0.7))
            except (TypeError, ValueError):
                temperature = 0.7

            output, _ = await call_llm(model_id, sys_prompt, user_prompt, temperature)
            handle_values[f"{nid}-response"] = output
            
        elif node_type == 'agent':
            prompt = node_inputs.get(f"{nid}-prompt", "Do something useful.")
            
            # Find connected tools
            tool_node_ids = []
            for edge in edges:
                if edge.target == nid and edge.targetHandle == f"{nid}-tools":
                    tool_node_ids.append(edge.source)
                    
            tool_nodes = [n for n in nodes if n['id'] in tool_node_ids and n.get('type') == 'tool']

            model_id = node_data.get('model', DEFAULT_MODEL)
            instructions = node_data.get('instructions', '')
            try:
                temperature = float(node_data.get('temperature', 0.7))
            except (TypeError, ValueError):
                temperature = 0.7
            try:
                max_steps = int(node_data.get('maxSteps', 6))
            except (TypeError, ValueError):
                max_steps = 6

            # Run the agent and yield its events!
            agent_output = ""
            async for event_str in run_agent(nid, prompt, tool_nodes, model_id, instructions, temperature, max_steps):
                yield event_str
                # Parse event string to accumulate final output
                try:
                    event_data = json.loads(event_str.replace("data: ", "").strip())
                    if event_data.get('type') == 'agent_final':
                        agent_output = event_data.get('output', '')
                except:
                    pass
                    
            output = agent_output
            handle_values[f"{nid}-response"] = output

        else:
            output = f"Executed {node_type}"
            
        tokens = len(str(output)) // 4
        yield f"data: {json.dumps({'type': 'node_complete', 'node_id': nid, 'output': output, 't': time.time() - t_start, 'tokens': tokens})}\n\n"
        
    yield f"data: {json.dumps({'type': 'done'})}\n\n"
