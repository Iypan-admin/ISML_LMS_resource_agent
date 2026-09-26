from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import get_settings
from app.api.health import router as health_router
from app.api.analysis import router as analysis_router
from app.api.discovery import router as discovery_router
from app.api.generation import router as generation_router
from app.api.review import router as review_router

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ISML AI Service — Intelligent OER Resource Discovery, Extraction, Quality & Copyright Evaluation",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router)
app.include_router(analysis_router)
app.include_router(discovery_router)
app.include_router(generation_router)
app.include_router(review_router)

@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
    }
