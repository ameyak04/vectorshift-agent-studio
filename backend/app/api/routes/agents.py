from fastapi import APIRouter
from typing import Dict, Any
from app.services import agent_store

router = APIRouter()


@router.get("")
async def list_agents():
    return {"agents": agent_store.list_agents()}


@router.post("")
async def save_agent(agent: Dict[str, Any]):
    return agent_store.upsert_agent(agent)


@router.delete("/{agent_id}")
async def delete_agent(agent_id: str):
    return {"deleted": agent_store.delete_agent(agent_id)}
