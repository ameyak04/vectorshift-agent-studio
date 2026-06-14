from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import pipelines

app = FastAPI(title="VectorShift Pipeline API")

# Allow the CRA dev server to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pipelines.router, prefix="/pipelines", tags=["pipelines"])

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}
