from pydantic import BaseModel, Field
from typing import List
from app.models.scoring import ScoreModel

class QualityAnalysisResult(BaseModel):
    relevance: ScoreModel = Field(..., description="Relevance to foreign language learning")
    language_quality: ScoreModel = Field(..., description="Accuracy and natural usage of target language")
    level_fit: ScoreModel = Field(..., description="Suitability for detected CEFR level")
    completeness: ScoreModel = Field(..., description="Completeness of material and structure")
    overall: ScoreModel = Field(..., description="Overall educational quality assessment")
    warnings: List[str] = Field(default_factory=list, description="Quality warnings or defects observed")
