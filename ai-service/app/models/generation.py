from pydantic import BaseModel, Field
from typing import List, Optional

class GeneratedVocabularyItem(BaseModel):
    term: str = Field(..., description="Target language term/phrase")
    part_of_speech: Optional[str] = Field(default="Noun", description="Grammatical part of speech")
    translation: str = Field(..., description="Translation or definition")
    example_sentence: Optional[str] = Field(default=None, description="Usage example in target language")

class GeneratedDialogueLine(BaseModel):
    speaker: str = Field(..., description="Speaker name or role")
    text: str = Field(..., description="Target language dialogue line")
    translation: Optional[str] = Field(default=None, description="English translation of line")

class GeneratedExercise(BaseModel):
    id: Optional[str] = Field(default=None, description="Unique question ID")
    question: str = Field(..., description="Exercise question or instruction")
    options: Optional[List[str]] = Field(default=None, description="Multiple choice options if applicable")
    answer: str = Field(..., description="Correct answer")
    explanation: Optional[str] = Field(default=None, description="Pedagogical explanation")

class ResourceGenerationResult(BaseModel):
    title: str = Field(..., description="Generated resource title")
    description: str = Field(..., description="Generated resource summary/description")
    content: str = Field(..., description="Main generated learning content text")
    dialogue_script: Optional[List[GeneratedDialogueLine]] = Field(default_factory=list, description="Situational dialogue script")
    vocabulary: List[GeneratedVocabularyItem] = Field(default_factory=list, description="Extracted or generated vocabulary items")
    exercises: List[GeneratedExercise] = Field(default_factory=list, description="Practice exercises")
    target_language: str = Field(..., description="Target language code or name")
    target_level: str = Field(..., description="Target CEFR level")
    resource_type: str = Field(..., description="ResourceType classification")
    confidence: str = Field(default="HIGH", description="Confidence level (HIGH/MEDIUM/LOW)")
    requires_human_review: bool = Field(default=True, description="Always requires human review before publishing OER")
    evidence: List[str] = Field(default_factory=list, description="Sources or design rationale evidence")
