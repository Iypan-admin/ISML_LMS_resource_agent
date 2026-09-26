from fastapi import APIRouter, status
from pydantic import BaseModel
from app.config import settings

router = APIRouter(tags=["Health"])

class HealthResponse(BaseModel):
    status: str
    service: str
    environment: str

@router.get("/health", status_code=status.HTTP_200_OK)
def get_health() -> HealthResponse:
    return HealthResponse(
        status="healthy",
        service=settings.PROJECT_NAME,
        environment=settings.ENVIRONMENT
    )

@router.get("/ready", status_code=status.HTTP_200_OK)
def get_readiness() -> HealthResponse:
    return HealthResponse(
        status="ready",
        service=settings.PROJECT_NAME,
        environment=settings.ENVIRONMENT
    )
