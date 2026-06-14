from fastapi import APIRouter
from app.models.pipeline import Pipeline
from app.services.graph import is_dag, execute_pipeline

router = APIRouter()

@router.post("/parse")
def parse_pipeline(pipeline: Pipeline):
    node_ids = [node.get('id') for node in pipeline.nodes if node.get('id')]
    trace = execute_pipeline(pipeline.nodes, pipeline.edges)
    
    return {
        'num_nodes': len(pipeline.nodes),
        'num_edges': len(pipeline.edges),
        'is_dag': is_dag(node_ids, pipeline.edges),
        'execution_trace': trace
    }
