import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import pipelines, files, agents

app = FastAPI(title="VectorShift Pipeline API")

# CORS: comma-separated origins from ALLOWED_ORIGINS, or "*" for local/dev.
# e.g. ALLOWED_ORIGINS="https://your-app.vercel.app,http://localhost:3000"
_origins = os.getenv("ALLOWED_ORIGINS", "*")
allow_origins = ["*"] if _origins.strip() == "*" else [o.strip() for o in _origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pipelines.router, prefix="/pipelines", tags=["pipelines"])
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(agents.router, prefix="/agents", tags=["agents"])

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}
