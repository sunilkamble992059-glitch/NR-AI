import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Explainable Neural Semantic Resume Screening API",
    description="Intelligent Resume Screening & Semantic Ranking Backend powered by Google Gemini and FastAPI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Explainable Neural Semantic Resume Screening API",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "jobs": "/api/jobs",
            "resumes": "/api/resumes",
            "analyze": "/api/analyze",
            "candidates": "/api/candidates",
            "ai_chat": "/api/ai/chat",
            "stats": "/api/dashboard/stats"
        }
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "gemini_api_key_set": bool(os.getenv("GEMINI_API_KEY"))
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=True)
