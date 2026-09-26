from typing import Dict, Any, List, Optional
from app.services.backend_client import BackendClient

class ClassificationAgent:
    """Agent for classifying resources against authoritative NestJS backend master domain values."""

    def __init__(self, backend_client: Optional[BackendClient] = None):
        self.backend_client = backend_client or BackendClient()

    async def classify_and_validate(
        self,
        suggested_language: Optional[str] = None,
        suggested_level: Optional[str] = None,
        suggested_resource_type: Optional[str] = None,
        suggested_categories: Optional[List[str]] = None,
        suggested_skills: Optional[List[str]] = None,
        suggested_topics: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        validation = await self.backend_client.validate_domain_classification(
            language_code=suggested_language,
            level_code=suggested_level,
            resource_type=suggested_resource_type,
            category_codes=suggested_categories,
            skill_codes=suggested_skills,
            topic_codes=suggested_topics,
        )

        return {
            "language_id": validation["valid_language_id"],
            "level_code": validation["valid_level_code"],
            "resource_type": validation["valid_resource_type"],
            "category_ids": validation["valid_category_ids"],
            "skill_ids": validation["valid_skill_ids"],
            "topic_ids": validation["valid_topic_ids"],
            "unmatched_suggestions": validation["unmatched"],
            "requires_human_review": validation["requires_human_review"],
        }
