from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI()

# Allow the CRA dev server to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Edge(BaseModel):
    source: str
    target: str

    # Edges from React Flow carry many extra fields (id, handles, type,
    # animated, markerEnd, ...). We only need source/target.
    class Config:
        extra = "allow"


class Pipeline(BaseModel):
    nodes: List[Dict[str, Any]] = []
    edges: List[Edge] = []


def is_dag(node_ids: List[str], edges: List[Edge]) -> bool:
    """Return True if the directed graph has no cycles (Kahn's algorithm)."""
    # Build adjacency list and in-degree map, ignoring edges that reference
    # nodes not in the pipeline.
    valid = set(node_ids)
    adjacency: Dict[str, List[str]] = {nid: [] for nid in valid}
    in_degree: Dict[str, int] = {nid: 0 for nid in valid}

    for edge in edges:
        if edge.source in valid and edge.target in valid:
            adjacency[edge.source].append(edge.target)
            in_degree[edge.target] += 1

    # Start with all nodes that have no incoming edges.
    queue = [nid for nid, deg in in_degree.items() if deg == 0]
    visited = 0

    while queue:
        current = queue.pop()
        visited += 1
        for neighbor in adjacency[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # If we visited every node, there was no cycle.
    return visited == len(valid)


@app.get('/')
def read_root():
    return {'Ping': 'Pong'}


@app.post('/pipelines/parse')
def parse_pipeline(pipeline: Pipeline):
    node_ids = [node.get('id') for node in pipeline.nodes if node.get('id')]
    return {
        'num_nodes': len(pipeline.nodes),
        'num_edges': len(pipeline.edges),
        'is_dag': is_dag(node_ids, pipeline.edges),
    }
