from pydantic import BaseModel, Field
from typing import Optional, List

class ResourceAnalysisRequest(BaseModel):
    url: Optional[str] = Field(default=None, description="External URL to analyze")
    text_content: Optional[str] = Field(default=None, description="Raw text content to analyze if no URL provided")
    known_language_code: Optional[str] = Field(default=None, description="Known language code if already selected (e.g. 'de', 'fr')")
    known_level_code: Optional[str] = Field(default=None, description="Known CEFR level code if already selected (e.g. 'A1', 'B2')")

class ResourceDiscoveryRequest(BaseModel):
    search_keywords: str = Field(..., min_length=2, description="Search term or topic keywords for discovery")
    target_languages: Optional[List[str]] = Field(default_factory=list, description="Target language codes")
    target_levels: Optional[List[str]] = Field(default_factory=list, description="Target CEFR levels")
    source_tab: Optional[str] = Field(default="Web", description="Source tab filter: 'Web', 'YouTube', 'PDF / Documents'")
    target_format: Optional[str] = Field(default=None, description="Resource format filter (e.g. 'Dialogue', 'VIDEO', 'ARTICLE', 'COURSE', 'WEBSITE')")
    topic: Optional[str] = Field(default=None, description="Specific academic topic selected")
    skill: Optional[str] = Field(default=None, description="Primary academic skill selected")
    limit: Optional[int] = Field(default=10, ge=1, le=50, description="Maximum candidate resources to discover")

class ResourceGenerationRequest(BaseModel):
    resource_type: str = Field(..., description="Target ResourceType (e.g. 'DIALOGUE', 'VOCABULARY_LIST', 'WORKSHEET')")
    target_language: str = Field(..., description="Target language name or code (e.g. 'German' or 'de')")
    target_level: str = Field(..., description="Target CEFR level (e.g. 'A1', 'B1')")
    topic: str = Field(..., description="Topic of generated resource (e.g. 'Ordering in a Restaurant')")
    course: Optional[str] = Field(default=None, description="Course name")
    category: Optional[str] = Field(default=None, description="Category classification")
    skill: Optional[str] = Field(default=None, description="Target skill (e.g. Speaking, Grammar)")
    learning_objective: Optional[str] = Field(default=None, description="Learning objective for the material")
    difficulty: Optional[str] = Field(default=None, description="Difficulty rating")
    target_audience: Optional[str] = Field(default=None, description="Intended audience")
    additional_requirements: Optional[str] = Field(default=None, description="Additional prompt requirements")
    instructions: Optional[str] = Field(default=None, description="Optional custom generation prompt/instructions")
