import httpx
from typing import Dict, Any, List, Optional
from app.config import settings
import logging

logger = logging.getLogger("BackendClient")

class BackendClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or settings.BACKEND_API_URL).rstrip("/")
        self.timeout = settings.BACKEND_TIMEOUT_SECONDS

    async def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Any:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                json_data = resp.json()
                if isinstance(json_data, dict) and "data" in json_data:
                    return json_data["data"]
                return json_data
        except Exception as err:
            logger.error(f"Backend HTTP GET '{url}' failed: {err}")
            return None

    async def get_languages(self) -> List[Dict[str, Any]]:
        result = await self._get("/languages")
        return result if isinstance(result, list) else []

    async def check_duplicate_url_hash(self, url_hash: str) -> Optional[Dict[str, Any]]:
        """Check if resource with urlHash already exists in NestJS backend."""
        resources = await self._get("/resources", params={"urlHash": url_hash})
        if isinstance(resources, list) and len(resources) > 0:
            return {"exists": True, "resource": resources[0]}
        return {"exists": False, "resource": None}


    async def get_courses(self, language_id: Optional[str] = None) -> List[Dict[str, Any]]:
        params = {"languageId": language_id} if language_id else None
        result = await self._get("/courses", params=params)
        return result if isinstance(result, list) else []

    async def get_levels(self) -> List[Dict[str, Any]]:
        result = await self._get("/levels")
        return result if isinstance(result, list) else []

    async def get_categories(self) -> List[Dict[str, Any]]:
        result = await self._get("/categories")
        return result if isinstance(result, list) else []

    async def get_skills(self) -> List[Dict[str, Any]]:
        result = await self._get("/skills")
        return result if isinstance(result, list) else []

    async def get_topics(self, language_id: Optional[str] = None) -> List[Dict[str, Any]]:
        params = {"languageId": language_id} if language_id else None
        result = await self._get("/topics", params=params)
        return result if isinstance(result, list) else []

    async def get_resource_types(self) -> List[Dict[str, Any]]:
        result = await self._get("/resource-types")
        return result if isinstance(result, list) else []

    async def get_sources(self) -> List[Dict[str, Any]]:
        result = await self._get("/sources")
        return result if isinstance(result, list) else []

    async def validate_domain_classification(
        self,
        language_code: Optional[str] = None,
        level_code: Optional[str] = None,
        resource_type: Optional[str] = None,
        category_codes: Optional[List[str]] = None,
        skill_codes: Optional[List[str]] = None,
        topic_codes: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Validate suggested classifications against live NestJS domain master data.
        Returns validation summary with valid IDs, unmatched items, and whether human review is required.
        """
        valid_language_id = None
        valid_level_code = None
        valid_resource_type = None
        valid_category_ids = []
        valid_skill_ids = []
        valid_topic_ids = []
        unmatched = []

        # 1. Validate Language
        if language_code:
            languages = await self.get_languages()
            lang_match = next((l for l in languages if l.get("code") == language_code.lower()), None)
            if lang_match:
                valid_language_id = lang_match.get("id")
            else:
                unmatched.append(f"Language code '{language_code}' not found in backend")

        # 2. Validate Level
        if level_code:
            levels = await self.get_levels()
            level_match = next((l for l in levels if l.get("code") == level_code.upper()), None)
            if level_match:
                valid_level_code = level_match.get("code")
            else:
                unmatched.append(f"Level code '{level_code}' not found in backend")

        # 3. Validate ResourceType
        if resource_type:
            types = await self.get_resource_types()
            type_match = next((t for t in types if t.get("type") == resource_type.upper()), None)
            if type_match:
                valid_resource_type = type_match.get("type")
            else:
                unmatched.append(f"Resource type '{resource_type}' not found in backend")

        # 4. Validate Categories
        if category_codes:
            categories = await self.get_categories()
            for cat_code in category_codes:
                cat_match = next((c for c in categories if c.get("code") == cat_code.lower() or c.get("slug") == cat_code.lower()), None)
                if cat_match:
                    valid_category_ids.append(cat_match.get("id"))
                else:
                    unmatched.append(f"Category '{cat_code}' not found in backend")

        # 5. Validate Skills
        if skill_codes:
            skills = await self.get_skills()
            for sk_code in skill_codes:
                sk_match = next((s for s in skills if s.get("code") == sk_code.lower() or s.get("slug") == sk_code.lower()), None)
                if sk_match:
                    valid_skill_ids.append(sk_match.get("id"))
                else:
                    unmatched.append(f"Skill '{sk_code}' not found in backend")

        # 6. Validate Topics
        if topic_codes:
            topics = await self.get_topics()
            for tp_code in topic_codes:
                tp_match = next((t for t in topics if t.get("code") == tp_code.lower() or t.get("slug") == tp_code.lower()), None)
                if tp_match:
                    valid_topic_ids.append(tp_match.get("id"))
                else:
                    unmatched.append(f"Topic '{tp_code}' not found in backend")

        requires_human_review = len(unmatched) > 0

        return {
            "valid_language_id": valid_language_id,
            "valid_level_code": valid_level_code,
            "valid_resource_type": valid_resource_type,
            "valid_category_ids": valid_category_ids,
            "valid_skill_ids": valid_skill_ids,
            "valid_topic_ids": valid_topic_ids,
            "unmatched": unmatched,
            "requires_human_review": requires_human_review,
        }
