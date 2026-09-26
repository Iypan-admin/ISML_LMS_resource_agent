from pydantic import BaseModel, Field
from typing import List, Literal

class ScoreModel(BaseModel):
    score: int = Field(default=0, ge=0, le=100, description="Score from 0 to 100 based on explicit criteria")
    score_basis: str = Field(..., description="Explicit rationale explaining why this score was assigned")
    evidence: List[str] = Field(default_factory=list, description="Concrete evidence snippets or observations supporting the score")
    confidence: Literal["HIGH", "MEDIUM", "LOW"] = Field(default="MEDIUM", description="Confidence level of the evaluation")
