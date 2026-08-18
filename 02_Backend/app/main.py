from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router

app = FastAPI(
    title="FuturePath AI Backend Service",
    description="Multi-tier career & educational pathway recommendation platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "service": "FuturePath AI API",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
