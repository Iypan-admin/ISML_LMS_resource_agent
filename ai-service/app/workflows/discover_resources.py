from typing import Optional, Dict, Any, List
from app.models.requests import ResourceDiscoveryRequest
from app.providers.search.mock_search import MockSearchProvider
from app.services.url_service import UrlService
from app.services.backend_client import BackendClient

class DiscoverResourcesWorkflow:
    """Resource candidate discovery and initial filtering workflow."""

    def __init__(
        self,
        search_provider: Optional[MockSearchProvider] = None,
        url_service: Optional[UrlService] = None,
        backend_client: Optional[BackendClient] = None,
    ):
        self.search_provider = search_provider or MockSearchProvider()
        self.url_service = url_service or UrlService()
        self.backend_client = backend_client or BackendClient()

    async def run(self, req: ResourceDiscoveryRequest) -> Dict[str, Any]:
        # 1. Fetch search candidates
        raw_candidates = await self.search_provider.search(
            query=req.search_keywords,
            limit=req.limit,
            target_languages=req.target_languages,
            target_levels=req.target_levels,
            source_tab=req.source_tab,
            target_format=req.target_format,
            topic=req.topic,
            skill=req.skill,
        )

        processed_candidates = []
        rejected_candidates = []

        for candidate in raw_candidates:
            # 2. SSRF URL Security Validation
            security_check = await self.url_service.validate_and_sanitize_url(candidate.url)
            if not security_check.is_valid:
                rejected_candidates.append({
                    "url": candidate.url,
                    "title": candidate.title,
                    "reason": f"Security validation failed: {security_check.security_reason}",
                })
                continue

            # 3. Duplicate check via urlHash
            dup_check = await self.backend_client.check_duplicate_url_hash(security_check.url_hash)
            exists_in_db = bool(dup_check and dup_check.get("exists"))

            processed_candidates.append({
                "title": candidate.title,
                "url": security_check.sanitized_url,
                "url_hash": security_check.url_hash,
                "snippet": candidate.snippet,
                "source_name": candidate.source_name,
                "confidence": candidate.confidence,
                "in_database": exists_in_db,
                "requires_human_review": not exists_in_db, # Candidate requires review if new
                "questions": candidate.questions if candidate.questions else None,
                "extracted_content": candidate.extracted_content,
            })

        return {
            "search_keywords": req.search_keywords,
            "target_languages": req.target_languages,
            "target_levels": req.target_levels,
            "discovered_count": len(processed_candidates),
            "candidates": processed_candidates,
            "rejected_candidates": rejected_candidates,
            "requires_human_review": True,
        }
