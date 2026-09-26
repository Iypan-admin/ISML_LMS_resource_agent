from pydantic import BaseModel, Field
from typing import List, Literal, Optional

class CopyrightAnalysisResult(BaseModel):
    license_name: str = Field(default="UNKNOWN", description="Name of detected license or terms")
    attribution_required: bool = Field(default=False)
    commercial_usage_allowed: bool = Field(default=True)
    modification_allowed: bool = Field(default=True)
    redistribution_allowed: bool = Field(default=True)
    hosting_permission: bool = Field(default=True)
    risk_level: Literal["LOW_CONCERN", "REVIEW_REQUIRED", "RESTRICTED", "UNKNOWN"] = Field(default="UNKNOWN")
    risk_explanation: str = Field(..., description="Explanation of potential copyright risk or terms")
    recommended_action: str = Field(..., description="Action recommendation for human curator")
    evidence: List[str] = Field(default_factory=list, description="Extracted copyright notice text or link evidence")
    warnings: List[str] = Field(default_factory=list, description="Licensing uncertainty warnings")
