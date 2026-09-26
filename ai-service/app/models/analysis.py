from pydantic import BaseModel, Field
from typing import Optional, List, Literal

class ResourceAnalysisResult(BaseModel):
    title: str = Field(..., description="Extracted or inferred resource title")
    description: str = Field(..., description="Extracted resource description")
    summary: str = Field(..., description="Concise summary of educational content")
    key_vocabulary: List[str] = Field(default_factory=list, description="Key vocabulary words extracted from content")
    detected_language: Optional[str] = Field(default=None, description="ISO language code detected (e.g. 'de', 'fr')")
    detected_cefr: Optional[str] = Field(default=None, description="Detected CEFR level (A1, A2, B1, B2, C1, C2)")
    detected_resource_type: Optional[str] = Field(default=None, description="Inferred ResourceType enum code")
    suggested_categories: List[str] = Field(default_factory=list, description="Category codes suggested")
    suggested_skills: List[str] = Field(default_factory=list, description="Skill codes suggested")
    suggested_topics: List[str] = Field(default_factory=list, description="Topic codes suggested")
    confidence: Literal["HIGH", "MEDIUM", "LOW"] = Field(default="MEDIUM")
    requires_human_review: bool = Field(default=True, description="True if any uncertainty or missing information exists")
    missing_information: List[str] = Field(default_factory=list, description="List of unverified or missing properties")
    evidence: List[str] = Field(default_factory=list, description="Textual evidence supporting classification decisions")
