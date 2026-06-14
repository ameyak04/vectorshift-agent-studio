"""
File-backed store for saved agents (the backend mirror in the local-first sync).

Persists to backend/data/agents.json. On free hosts the disk may be ephemeral —
that's acceptable here because the browser's localStorage is the source of truth;
this just lets saves sync across devices when the disk persists.
"""

import json
import os
import threading
from typing import List, Dict, Any

_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
_PATH = os.path.join(_DIR, "agents.json")
_lock = threading.Lock()


def _read() -> Dict[str, Dict[str, Any]]:
    try:
        with open(_PATH, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def _write(data: Dict[str, Dict[str, Any]]) -> None:
    os.makedirs(_DIR, exist_ok=True)
    tmp = _PATH + ".tmp"
    with open(tmp, "w") as f:
        json.dump(data, f)
    os.replace(tmp, _PATH)


def list_agents() -> List[Dict[str, Any]]:
    with _lock:
        return sorted(_read().values(), key=lambda a: a.get("updatedAt", 0), reverse=True)


def upsert_agent(agent: Dict[str, Any]) -> Dict[str, Any]:
    """Insert or update by id; last-write-wins by updatedAt."""
    with _lock:
        data = _read()
        aid = agent.get("id")
        if not aid:
            return agent
        existing = data.get(aid)
        if not existing or agent.get("updatedAt", 0) >= existing.get("updatedAt", 0):
            data[aid] = agent
            _write(data)
        return data[aid]


def delete_agent(agent_id: str) -> bool:
    with _lock:
        data = _read()
        if agent_id in data:
            del data[agent_id]
            _write(data)
            return True
        return False
