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
