from app.models.copyright import CopyrightAnalysisResult
from typing import Optional

class CopyrightAgent:
    """Agent for copyright and license evaluation."""

    async def analyze_copyright(
        self,
        url: Optional[str] = None,
        content: Optional[str] = None,
        source_name: Optional[str] = None,
    ) -> CopyrightAnalysisResult:
        evidence = []
        warnings = []
        text_to_check = (content or "") + " " + (url or "")

        license_name = "UNKNOWN"
        attribution_required = True
        commercial_usage = True
        risk_level = "LOW_CONCERN"
        explanation = "Public web content analyzed for licensing indicators."
        recommendation = "Standard human review before publishing."

        text_lower = text_to_check.lower()

        if "creative commons" in text_lower or "cc-by" in text_lower or "cc by" in text_lower:
            license_name = "Creative Commons (CC BY)"
            attribution_required = True
            risk_level = "LOW_CONCERN"
            evidence.append("Detected Creative Commons license terms in text/URL")
            explanation = "Creative Commons license detected. Open educational resource."
            recommendation = "Attribution required when publishing."
        elif "all rights reserved" in text_lower or "copyright ©" in text_lower:
            license_name = "All Rights Reserved"
            commercial_usage = False
            risk_level = "REVIEW_REQUIRED"
            evidence.append("Detected 'All Rights Reserved' copyright statement")
            warnings.append("Publisher claims full copyright. Verify permission to link or embed.")
            explanation = "Publisher retains full rights. Fair use or link-only recommendation."
            recommendation = "Review hosting permission or use canonical URL link only."
        else:
            evidence.append("No explicit license statement found in metadata")
            warnings.append("License terms not explicitly stated in content sample")
            risk_level = "REVIEW_REQUIRED"

        return CopyrightAnalysisResult(
            license_name=license_name,
            attribution_required=attribution_required,
            commercial_usage_allowed=commercial_usage,
            modification_allowed=True,
            redistribution_allowed=True,
            hosting_permission=risk_level == "LOW_CONCERN",
            risk_level=risk_level,
            risk_explanation=explanation,
            recommended_action=recommendation,
            evidence=evidence,
            warnings=warnings,
        )
