from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.pipeline import Pipeline, EvalRequest
from app.services.graph import execute_pipeline
from app.services.eval import evaluate_cases

router = APIRouter()

@router.post("/parse")
async def parse_pipeline(pipeline: Pipeline):
    return StreamingResponse(
        execute_pipeline(pipeline.nodes, pipeline.edges),
        media_type="text/event-stream"
    )

@router.post("/evaluate")
async def evaluate_pipeline(req: EvalRequest):
    results = await evaluate_cases(req.nodes, req.edges, req.cases)
    return {"results": results}
