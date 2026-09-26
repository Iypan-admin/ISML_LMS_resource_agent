from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from app.models.responses import ApiResponse
from app.workflows.review_preparation import ReviewPreparationWorkflow

router = APIRouter(prefix="/api/v1/ai", tags=["Human Review Preparation"])

@router.post("/prepare-review", response_model=ApiResponse)
async def prepare_for_review(analysis_data: Dict[str, Any] = Body(...)):
    """Prepare human-review dossier and NestJS CreateResourceDto payload from analysis results."""
    try:
        workflow = ReviewPreparationWorkflow()
        dossier = await workflow.prepare_for_review(analysis_data)
        return ApiResponse(
            success=True,
            message="Human review dossier prepared successfully",
            data=dossier,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to prepare review dossier: {str(e)}")
