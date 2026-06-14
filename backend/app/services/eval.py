import json
import re
import time
from typing import List, Dict, Any

from app.models.pipeline import EvalCase, Edge
from app.services.graph import execute_pipeline

async def evaluate_cases(nodes: List[Dict[str, Any]], edges: List[Edge], cases: List[EvalCase]) -> List[Dict[str, Any]]:
    results = []
    
    for case in cases:
        t0 = time.time()
        
        # 1. Override inputs in a copied node list
        test_nodes = []
        for n in nodes:
            node_copy = dict(n)
            node_copy['data'] = dict(n.get('data', {}))
            
            if n['id'] in case.inputs:
                node_copy['data']['inputValue'] = case.inputs[n['id']]
                
            test_nodes.append(node_copy)
            
        # 2. Run pipeline headlessly (collecting all events)
        actual_output = None
        
        async for event_str in execute_pipeline(test_nodes, edges):
            if not event_str.startswith("data: "):
                continue
                
            try:
                event = json.loads(event_str.replace("data: ", "").strip())
                if event.get("type") == "node_complete" and event.get("node_id") == case.assertion.target_node:
                    actual_output = event.get("output", "")
            except:
                pass
                
        # 3. Evaluate assertion
        passed = False
        actual_str = str(actual_output)
        expected_str = case.assertion.expected
        atype = case.assertion.type
        
        if actual_output is None:
            passed = False
            actual_str = "[Error: Target node did not execute or produce output]"
        elif atype == 'equals':
            passed = actual_str.strip() == expected_str.strip()
        elif atype == 'contains':
            passed = expected_str.lower() in actual_str.lower()
        elif atype == 'regex':
            try:
                passed = bool(re.search(expected_str, actual_str))
            except Exception as e:
                passed = False
                actual_str = f"[Regex Error: {str(e)}] " + actual_str
                
        latency = time.time() - t0
        
        results.append({
            "case_id": case.id,
            "passed": passed,
            "actual": actual_str,
            "expected": expected_str,
            "latency": latency
        })
        
    return results
