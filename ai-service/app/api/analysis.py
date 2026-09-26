from fastapi import APIRouter, HTTPException
from app.models.requests import ResourceAnalysisRequest
from app.models.responses import ApiResponse
from app.workflows.analyze_resource import AnalyzeResourceWorkflow

router = APIRouter(prefix="/api/v1/ai", tags=["Resource Analysis"])

@router.post("/analyze", response_model=ApiResponse)
async def analyze_resource(req: ResourceAnalysisRequest):
    """Analyze resource content or URL, ground metadata with NestJS backend, and evaluate quality/copyright."""
    try:
        workflow = AnalyzeResourceWorkflow()
        res = await workflow.run(req)
        if not res.get("success", False):
            raise HTTPException(status_code=400, detail=res.get("error", "Analysis failed"))
        return ApiResponse(
            success=True,
            message="Resource analysis completed successfully",
            data=res,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal AI Service Error: {str(e)}")
