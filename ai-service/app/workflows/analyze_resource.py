from typing import Optional, Dict, Any
from app.models.requests import ResourceAnalysisRequest
from app.services.url_service import UrlService
from app.services.backend_client import BackendClient
from app.agents.resource_analysis_agent import ResourceAnalysisAgent
from app.agents.classification_agent import ClassificationAgent
from app.agents.quality_agent import QualityAgent
from app.agents.copyright_agent import CopyrightAgent

class AnalyzeResourceWorkflow:
    """End-to-end resource analysis and domain validation workflow."""

    def __init__(
        self,
        url_service: Optional[UrlService] = None,
        backend_client: Optional[BackendClient] = None,
        analysis_agent: Optional[ResourceAnalysisAgent] = None,
        classification_agent: Optional[ClassificationAgent] = None,
        quality_agent: Optional[QualityAgent] = None,
        copyright_agent: Optional[CopyrightAgent] = None,
    ):
        self.url_service = url_service or UrlService()
        self.backend_client = backend_client or BackendClient()
        self.analysis_agent = analysis_agent or ResourceAnalysisAgent()
        self.classification_agent = classification_agent or ClassificationAgent(self.backend_client)
        self.quality_agent = quality_agent or QualityAgent()
        self.copyright_agent = copyright_agent or CopyrightAgent()

    async def run(self, req: ResourceAnalysisRequest) -> Dict[str, Any]:
        url = req.url
        content = req.text_content or ""
        url_security_info = None

        # 1. URL Security & Extraction if URL provided
        if url:
            security_check = await self.url_service.validate_and_sanitize_url(url)
            if not security_check.is_valid:
                return {
                    "success": False,
                    "error": f"URL Security Validation Failed: {security_check.security_reason}",
                    "security": {
                        "is_valid": False,
                        "url_hash": security_check.url_hash,
                        "reason": security_check.security_reason,
                    }
                }
            url = security_check.sanitized_url
            url_security_info = {
                "sanitized_url": security_check.sanitized_url,
                "url_hash": security_check.url_hash,
                "domain": security_check.domain,
            }
            # Simulated content extraction if no raw text provided
            if not content:
                content = f"Sample extracted content from {url}. Educational language learning material."

        if not content.strip():
            return {
                "success": False,
                "error": "No content available to analyze. Please provide a valid URL or text_content.",
            }

        # 2. Extract Metadata via Analysis Agent
        analysis = await self.analysis_agent.analyze(
            content=content,
            known_language_code=req.known_language_code,
            known_level_code=req.known_level_code,
        )

        # 3. Ground against NestJS Backend Domain Contracts
        domain_validation = await self.classification_agent.classify_and_validate(
            suggested_language=analysis.detected_language,
            suggested_level=analysis.detected_cefr,
            suggested_resource_type=analysis.detected_resource_type,
            suggested_categories=analysis.suggested_categories,
            suggested_skills=analysis.suggested_skills,
            suggested_topics=analysis.suggested_topics,
        )

        # 4. Educational Quality Evaluation
        quality = await self.quality_agent.evaluate_quality(analysis=analysis, content=content)

        # 5. Copyright & License Analysis
        copyright_res = await self.copyright_agent.analyze_copyright(
            url=url,
            content=content,
        )

        # 6. Check for duplicate resource via NestJS Backend (if url_hash exists)
        is_duplicate = False
        duplicate_details = None
        if url_security_info and url_security_info.get("url_hash"):
            check_dup = await self.backend_client.check_duplicate_url_hash(url_security_info["url_hash"])
            if check_dup and check_dup.get("exists"):
                is_duplicate = True
                duplicate_details = check_dup.get("resource")

        # 7. Overall Confidence & Human Review Flag
        requires_human_review = (
            analysis.requires_human_review or
            domain_validation["requires_human_review"] or
            copyright_res.risk_level != "LOW_CONCERN" or
            is_duplicate
        )

        overall_confidence = "HIGH"
        if len(analysis.missing_information) > 0 or len(domain_validation.get("unmatched", [])) > 0:
            overall_confidence = "MEDIUM"
        if not domain_validation.get("language_id") or is_duplicate:
            overall_confidence = "LOW"


        return {
            "success": True,
            "url_security": url_security_info,
            "analysis": analysis.model_dump(),
            "domain_classification": domain_validation,
            "quality": quality.model_dump(),
            "copyright": copyright_res.model_dump(),
            "duplicate_check": {
                "is_duplicate": is_duplicate,
                "existing_resource": duplicate_details,
            },
            "overall_confidence": overall_confidence,
            "requires_human_review": requires_human_review,
        }
