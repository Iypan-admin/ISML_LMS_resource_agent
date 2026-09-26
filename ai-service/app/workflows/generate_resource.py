from typing import Optional, Dict, Any
from app.models.requests import ResourceGenerationRequest
from app.agents.generation_agent import GenerationAgent
from app.services.backend_client import BackendClient

class GenerateResourceWorkflow:
    """Resource generation workflow with NestJS backend domain validation."""

    def __init__(
        self,
        generation_agent: Optional[GenerationAgent] = None,
        backend_client: Optional[BackendClient] = None,
    ):
        self.generation_agent = generation_agent or GenerationAgent()
        self.backend_client = backend_client or BackendClient()

    async def run(self, req: ResourceGenerationRequest) -> Dict[str, Any]:
        # 1. Generate content via agent
        gen_result = await self.generation_agent.generate(req)

        # 2. Validate classification against backend
        domain_validation = await self.backend_client.validate_domain_classification(
            language_code=req.target_language,
            level_code=req.target_level,
            resource_type=req.resource_type,
        )

        return {
            "success": True,
            "generated_resource": gen_result.model_dump(),
            "domain_classification": domain_validation,
            "requires_human_review": True, # ALWAYS True for generated content
            "status": "DRAFT",
        }
