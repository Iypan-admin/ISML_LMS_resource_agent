from fastapi import APIRouter, HTTPException
from app.models.requests import ResourceGenerationRequest
from app.models.responses import ApiResponse
from app.workflows.generate_resource import GenerateResourceWorkflow

router = APIRouter(prefix="/api/v1/ai", tags=["Resource Generation"])

@router.post("/generate", response_model=ApiResponse)
async def generate_resource(req: ResourceGenerationRequest):
    """Generate structured educational resource content and ground classification against NestJS domain."""
    try:
        workflow = GenerateResourceWorkflow()
        res = await workflow.run(req)
        return ApiResponse(
            success=True,
            message="Resource content generated successfully",
            data=res,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resource generation failed: {str(e)}")
