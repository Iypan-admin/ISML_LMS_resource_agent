from typing import Dict, Any, Optional
import re

class ReviewPreparationWorkflow:
    """Assembles AI analysis and grounded metadata into a NestJS-ready resource creation payload for human review."""

    @staticmethod
    def slugify(text: str) -> str:
        slug = text.lower().strip()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[\s_-]+', '-', slug)
        return slug[:80].strip('-') or "ai-resource"

    async def prepare_for_review(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        analysis = analysis_data.get("analysis", {})
        domain = analysis_data.get("domain_classification", {})
        url_sec = analysis_data.get("url_security") or {}
        quality = analysis_data.get("quality", {})
        copyright_info = analysis_data.get("copyright", {})

        title = analysis.get("title", "Untitled Resource")
        slug = self.slugify(title)

        resource_payload = {
            "title": title,
            "slug": slug,
            "description": analysis.get("description", ""),
            "languageId": domain.get("language_id"),
            "resourceType": domain.get("resource_type", "ARTICLE"),
            "status": "PENDING_REVIEW", # NEVER PUBLISHED AUTOMATICALLY
            "originalUrl": url_sec.get("sanitized_url"),
            "normalizedUrl": url_sec.get("sanitized_url"),
            "levelIds": [lvl for lvl in [domain.get("level_id")] if lvl],
            "categoryIds": domain.get("category_ids", []),
            "skillIds": domain.get("skill_ids", []),
            "topicIds": domain.get("topic_ids", []),
        }

        review_dossier = {
            "resource_payload": resource_payload,
            "ai_metadata": {
                "detected_cefr": analysis.get("detected_cefr"),
                "detected_language": analysis.get("detected_language"),
                "key_vocabulary": analysis.get("key_vocabulary", []),
                "summary": analysis.get("summary"),
            },
            "validation_status": {
                "requires_human_review": True,
                "overall_confidence": analysis_data.get("overall_confidence", "MEDIUM"),
                "unmatched_suggestions": domain.get("unmatched_suggestions", {}),
            },
            "quality_dossier": quality,
            "copyright_dossier": copyright_info,
            "evidence": analysis.get("evidence", []) + copyright_info.get("evidence", []),
        }

        return review_dossier
