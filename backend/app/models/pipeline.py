from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any

class Edge(BaseModel):
    source: str
    target: str
    sourceHandle: str = None
    targetHandle: str = None

class Pipeline(BaseModel):
    nodes: List[Dict[str, Any]] = []
    edges: List[Edge] = []

class EvalAssertion(BaseModel):
    type: str # contains, equals, regex
    target_node: str
    expected: str

class EvalCase(BaseModel):
    id: str
    name: str
    inputs: Dict[str, str] # customInput node IDs to their overriding value
    assertion: EvalAssertion

class EvalRequest(BaseModel):
    nodes: List[Dict[str, Any]] = []
    edges: List[Edge] = []
    cases: List[EvalCase] = []
