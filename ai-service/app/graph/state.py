"""
LangGraph State Definitions for the ISML Intelligent Content Pipeline.

The state flows through the graph, accumulating results at each node.
"""
from __future__ import annotations
from typing import TypedDict, Optional, Any, Annotated
from operator import add


class SourceChunk(TypedDict):
    """A partitioned chunk of source evidence assigned to a specific period."""
    chunk_id: str
    period_number: int
    content: str
    vocab_items: list[str]
    grammar_points: list[str]
    expressions: list[str]
    source_names: list[str]


class PeriodContent(TypedDict):
    """Generated content for a single period/session."""
    period_number: int
    day_topic: str
    grammar_rules_detail: str
    study_notes_markdown: str
    vocabulary_bank: list[dict]
    classroom_dialogues: list[str]
    pedagogical_instructions: str
    video_breakdown_analysis: str
    in_class_exercises: list[str]
    exercise_solutions: list[dict]
    homework_tasks: list[str]
    quality_score: float
    generation_attempt: int
    source_grounding_score: float


class QualityReport(TypedDict):
    """Quality validation result for generated content."""
    period_number: int
    passed: bool
    overall_score: float
    source_grounding_score: float
    uniqueness_score: float
    completeness_score: float
    issues: list[str]
    recommendations: list[str]


class PipelineState(TypedDict):
    """Master state for the LangGraph content generation pipeline."""
    # Input parameters
    session_id: str
    language: str
    level: str
    topic: str
    track_mode: str
    institution_type: str
    course_duration_hours: int
    period_duration_minutes: int
    periods_per_week: int
    total_periods: int
    assessments_count: int
    
    # Source materials
    raw_source_context: str
    extracted_sources: list[dict]
    
    # Prompt engineering
    user_prompt: str
    enhanced_master_prompt: str
    
    # Source analysis results
    source_analysis: dict
    source_partitions: list[SourceChunk]
    
    # Instruction design
    instruction_plan: dict
    
    # Generation tracking
    current_period: int
    periods_to_generate: list[int]
    generated_periods: Annotated[list[PeriodContent], add]
    previously_covered_topics: Annotated[list[str], add]
    
    # Quality control
    quality_reports: Annotated[list[QualityReport], add]
    retry_periods: list[int]
    max_retries: int
    
    # Final output
    session_plan: dict
    teacher_materials: dict
    student_lsrw: dict
    
    # Pipeline metadata
    pipeline_stage: str
    error_log: Annotated[list[str], add]
    total_llm_calls: int
