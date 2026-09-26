from fastapi import APIRouter, HTTPException
from app.models.requests import ResourceDiscoveryRequest
from app.models.responses import ApiResponse
from app.workflows.discover_resources import DiscoverResourcesWorkflow

router = APIRouter(prefix="/api/v1/ai", tags=["Resource Discovery"])

@router.post("/discover", response_model=ApiResponse)
async def discover_resources(req: ResourceDiscoveryRequest):
    """Discover candidate resources using search providers and apply URL security and duplicate checks."""
    try:
        workflow = DiscoverResourcesWorkflow()
        res = await workflow.run(req)
        return ApiResponse(
            success=True,
            message=f"Discovered {res.get('discovered_count', 0)} candidate resources",
            data=res,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Discovery failed: {str(e)}")
