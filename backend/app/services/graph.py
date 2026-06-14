import os
import re
from typing import List, Dict, Any
import google.generativeai as genai
from app.models.pipeline import Edge
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)

def topological_sort(node_ids: List[str], edges: List[Edge]) -> List[str]:
    valid = set(node_ids)
    adjacency: Dict[str, List[str]] = {nid: [] for nid in valid}
    in_degree: Dict[str, int] = {nid: 0 for nid in valid}

    for edge in edges:
        if edge.source in valid and edge.target in valid:
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

def execute_pipeline(nodes: List[Dict[str, Any]], edges: List[Edge]) -> Dict[str, str]:
    node_ids = [n.get('id') for n in nodes if n.get('id')]
    sorted_ids = topological_sort(node_ids, edges)
    
    if not sorted_ids:
        return {"error": "Pipeline contains cycles and cannot be executed."}
        
    node_map = {n['id']: n for n in nodes if 'id' in n}
    handle_values = {}
    execution_trace = {}
    
    for nid in sorted_ids:
        node = node_map[nid]
        node_type = node.get('type')
        node_data = node.get('data', {})
        
        # Gather inputs for this node
        node_inputs = {}
        for edge in edges:
            if edge.target == nid:
                val = handle_values.get(edge.sourceHandle, "")
                node_inputs[edge.targetHandle] = val
                
        output = None
        
        if node_type == 'customInput':
            name = node_data.get('inputName', 'default_input')
            output = f"{name}_value"
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
            op = node_data.get('operation', 'add')
            a_str = node_inputs.get(f"{nid}-a", "0")
            b_str = node_inputs.get(f"{nid}-b", "0")
            
            try:
                a = float(a_str)
            except:
                a = 0
            try:
                b = float(b_str)
            except:
                b = 0
                
            res = 0
            if op == 'add': res = a + b
            elif op == 'subtract': res = a - b
            elif op == 'multiply': res = a * b
            elif op == 'divide': res = a / b if b != 0 else float('inf')
            
            output = str(res)
            handle_values[f"{nid}-result"] = output
            
        elif node_type == 'llm':
            sys_prompt = node_inputs.get(f"{nid}-system", "You are a helpful assistant.")
            user_prompt = node_inputs.get(f"{nid}-prompt", "")
            
            prompt = f"System: {sys_prompt}\n\nUser: {user_prompt}"
            if not api_key:
                output = f"[Mock LLM] API key not found. Simulated response to: {user_prompt}"
            else:
                try:
                    model = genai.GenerativeModel('gemini-3.5-flash')
                    response = model.generate_content(prompt)
                    output = response.text
                except Exception as e:
                    if "429" in str(e) or "quota" in str(e).lower():
                        output = f"[Rate Limited] The API key exceeded its quota. Simulated response to: {user_prompt}"
                    else:
                        output = f"Error calling LLM: {str(e)}"
                    
            handle_values[f"{nid}-response"] = output
            
        else:
            output = f"Executed {node_type}"
            
        execution_trace[nid] = output
        
    return execution_trace
