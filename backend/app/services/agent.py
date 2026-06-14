import json
import asyncio
import time
from typing import List, Dict, Any, AsyncGenerator

from app.services.llm import resolve, provider_key, DEFAULT_MODEL

import urllib.request
import urllib.parse
from math import *


def execute_tool_logic(kind: str, args: Dict[str, Any]) -> str:
    """Single source of truth for tool execution (shared by DAG nodes and agents)."""
    try:
        if kind == 'web_search':
            query = args.get('query', '')
            try:
                from duckduckgo_search import DDGS
                with DDGS() as ddgs:
                    results = [r for r in ddgs.text(query, max_results=3)]
                return "\n\n".join([f"Source: {r['href']}\n{r['body']}" for r in results])
            except Exception as e:
                return f"Search failed: {str(e)}"

        elif kind == 'calculator':
            expr = args.get('expression', '0')
            allowed_names = {k: v for k, v in globals().items() if not k.startswith("_")}
            try:
                res = eval(expr, {"__builtins__": None}, allowed_names)
                return str(res)
            except Exception as e:
                return f"Math error: {str(e)}"

        elif kind == 'http_get':
            url = args.get('url', '')
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=5) as response:
                    return response.read().decode('utf-8')[:2000]
            except Exception as e:
                return f"HTTP error: {str(e)}"

        return f"Unknown tool kind: {kind}"
    except Exception as e:
        return str(e)


def _tool_param_schema(kind: str):
    """Normalized {properties, required} for a tool kind."""
    if kind == 'web_search':
        return {'query': {'type': 'string', 'description': 'The search query'}}, ['query']
    if kind == 'calculator':
        return {'expression': {'type': 'string', 'description': 'A mathematical expression'}}, ['expression']
    if kind == 'http_get':
        return {'url': {'type': 'string', 'description': 'The URL to fetch'}}, ['url']
    return {}, []


def _build_tools(tool_nodes: List[Dict]):
    """Return (specs, node_by_name, handlers) where specs is provider-neutral."""
    specs = []
    node_by_name = {}
    handlers = {}
    for tn in tool_nodes:
        name = tn.get('data', {}).get('toolName', 'tool').replace(' ', '_').replace('-', '_')
        kind = tn.get('data', {}).get('toolKind', 'web_search')
        desc = tn.get('data', {}).get('toolDesc', 'No description')
        props, required = _tool_param_schema(kind)
        specs.append({'name': name, 'description': desc, 'properties': props, 'required': required})
        node_by_name[name] = tn
        handlers[name] = kind
    return specs, node_by_name, handlers


def _sse(payload: Dict[str, Any]) -> str:
    return f"data: {json.dumps(payload)}\n\n"


async def run_agent(
    agent_id: str,
    prompt: str,
    tool_nodes: List[Dict],
    model_id: str = DEFAULT_MODEL,
    instructions: str = "",
    temperature: float = 0.7,
    max_steps: int = 6,
) -> AsyncGenerator[str, None]:
    """Run a tool-using agent loop, streaming SSE events. Provider is chosen from model_id;
    falls back to a deterministic simulated trajectory when no key / rate-limited."""
    t0 = time.time()
    provider, model_name, label = resolve(model_id)
    key = provider_key(provider)
    specs, node_by_name, handlers = _build_tools(tool_nodes)
    system = instructions or "You are an autonomous agent. Use the available tools to accomplish the goal, then give a final answer."

    def ev(payload):
        payload.setdefault('agent_id', agent_id)
        payload.setdefault('t', time.time() - t0)
        return _sse(payload)

    async def run_fallback(reason: str):
        yield ev({'type': 'agent_thought', 'thought': f'[{label} · simulated] {reason}', 'tokens': 5})
        await asyncio.sleep(0.8)
        step = 1
        for tn in tool_nodes:
            name = tn.get('data', {}).get('toolName', 'tool')
            kind = tn.get('data', {}).get('toolKind', 'web_search')
            args = {'web_search': {'query': prompt[:60] or 'vector databases'},
                    'calculator': {'expression': '100 * 10'},
                    'http_get': {'url': 'https://example.com'}}.get(kind, {})
            yield ev({'type': 'tool_call', 'tool_node_id': tn['id'], 'tool_name': name, 'args': args, 'step': step, 'tokens': 10})
            await asyncio.sleep(0.8)
            res = execute_tool_logic(kind, args)
            yield ev({'type': 'tool_result', 'tool_node_id': tn['id'], 'result': res, 'step': step, 'tokens': len(res) // 4})
            step += 1
            await asyncio.sleep(0.8)
        yield ev({'type': 'agent_final', 'output': f'Simulated trajectory complete using {label}. (fallback mode)', 'tokens': 20})

    if not key:
        async for e in run_fallback("no API key configured for this provider."):
            yield e
        return

    try:
        if provider == "gemini":
            async for e in _gemini_loop(agent_id, prompt, system, model_name, temperature, max_steps,
                                        specs, node_by_name, handlers, key, ev):
                yield e
        elif provider == "anthropic":
            async for e in _anthropic_loop(agent_id, prompt, system, model_name, temperature, max_steps,
                                           specs, node_by_name, handlers, key, ev):
                yield e
        else:
            async for e in run_fallback(f"{provider} tool-use not wired; simulating."):
                yield e
    except Exception as e:
        msg = str(e)
        if "429" in msg or "quota" in msg.lower() or "rate" in msg.lower():
            async for ev_str in run_fallback("provider rate-limited; simulating."):
                yield ev_str
        else:
            yield ev({'type': 'agent_final', 'output': f'Error in agent loop: {msg}', 'tokens': 0})


async def _gemini_loop(agent_id, prompt, system, model_name, temperature, max_steps,
                       specs, node_by_name, handlers, key, ev):
    import google.generativeai as genai
    from google.generativeai.types import FunctionDeclaration, Tool
    genai.configure(api_key=key)

    decls = [FunctionDeclaration(
        name=s['name'], description=s['description'],
        parameters={"type": "OBJECT",
                    "properties": {k: {"type": v['type'].upper(), "description": v['description']}
                                   for k, v in s['properties'].items()},
                    "required": s['required']},
    ) for s in specs]

    model = genai.GenerativeModel(
        model_name,
        system_instruction=system,
        tools=[Tool(function_declarations=decls)] if decls else None,
    )
    yield ev({'type': 'agent_thought', 'thought': f'Starting agent loop on {model_name}…', 'tokens': 5})
    chat = model.start_chat()
    current = f"Goal: {prompt}"

    for step in range(1, max_steps + 1):
        response = await chat.send_message_async(current)
        has_tool = False
        for part in (response.parts or []):
            if fn_call := getattr(part, 'function_call', None):
                has_tool = True
                name = fn_call.name
                args = dict(fn_call.args)
                tn = node_by_name.get(name)
                if not tn:
                    continue
                kind = handlers.get(name, 'web_search')
                yield ev({'type': 'tool_call', 'tool_node_id': tn['id'], 'tool_name': name, 'args': args, 'step': step, 'tokens': 15})
                res = execute_tool_logic(kind, args)
                yield ev({'type': 'tool_result', 'tool_node_id': tn['id'], 'result': res, 'step': step, 'tokens': len(res) // 4})
                current = f"Tool '{name}' returned:\n{res}\nContinue toward the goal or give the final answer."
                break
        if not has_tool:
            yield ev({'type': 'agent_final', 'output': response.text, 'tokens': len(response.text) // 4})
            return
    yield ev({'type': 'agent_final', 'output': '[Max steps reached without a final answer.]', 'tokens': 0})


async def _anthropic_loop(agent_id, prompt, system, model_name, temperature, max_steps,
                          specs, node_by_name, handlers, key, ev):
    from anthropic import AsyncAnthropic
    client = AsyncAnthropic(api_key=key)

    tools = [{"name": s['name'], "description": s['description'],
              "input_schema": {"type": "object", "properties": s['properties'], "required": s['required']}}
             for s in specs]

    yield ev({'type': 'agent_thought', 'thought': f'Starting agent loop on {model_name}…', 'tokens': 5})
    messages = [{"role": "user", "content": f"Goal: {prompt}"}]

    for step in range(1, max_steps + 1):
        resp = await client.messages.create(
            model=model_name, max_tokens=1024, temperature=temperature,
            system=system, tools=tools if tools else None, messages=messages,
        )
        tool_uses = [b for b in resp.content if getattr(b, "type", None) == "tool_use"]
        texts = [b.text for b in resp.content if getattr(b, "type", None) == "text"]
        if texts and texts[0].strip():
            yield ev({'type': 'agent_thought', 'thought': texts[0].strip()[:400], 'tokens': len(texts[0]) // 4})

        if not tool_uses:
            final = "\n".join(texts).strip() or "[No final text returned.]"
            yield ev({'type': 'agent_final', 'output': final, 'tokens': len(final) // 4})
            return

        messages.append({"role": "assistant", "content": resp.content})
        tool_results = []
        for tu in tool_uses:
            name = tu.name
            args = dict(tu.input or {})
            tn = node_by_name.get(name)
            if not tn:
                tool_results.append({"type": "tool_result", "tool_use_id": tu.id, "content": "Unknown tool."})
                continue
            kind = handlers.get(name, 'web_search')
            yield ev({'type': 'tool_call', 'tool_node_id': tn['id'], 'tool_name': name, 'args': args, 'step': step, 'tokens': 15})
            res = execute_tool_logic(kind, args)
            yield ev({'type': 'tool_result', 'tool_node_id': tn['id'], 'result': res, 'step': step, 'tokens': len(res) // 4})
            tool_results.append({"type": "tool_result", "tool_use_id": tu.id, "content": res})
        messages.append({"role": "user", "content": tool_results})

    yield ev({'type': 'agent_final', 'output': '[Max steps reached without a final answer.]', 'tokens': 0})
