"""
Structured data models for the Source-Driven Dynamic Pipeline.

Covers: extraction results, evidence analysis, instruction plans,
validation reports, and quality evaluation.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


# =============================================================================
# Stage A: Source Extraction Models
# =============================================================================

class ExtractionStatus(str, Enum):
    SUCCESS = "success"
    PARTIAL = "partial"
    FAILED = "failed"
    UNSUPPORTED = "unsupported"


class ExtractedSource(BaseModel):
    """Structured result from extracting a single source file or URL."""
    source_id: str = Field(..., description="Unique identifier for this source")
    source_name: str = Field(..., description="Original filename or URL")
    source_type: str = Field(..., description="e.g. YOUTUBE, WEB_ARTICLE, PDF, DOCX, PPTX, AUDIO, IMAGE, TEXT")
    status: ExtractionStatus = ExtractionStatus.SUCCESS
    extracted_text: str = Field(default="", description="Full extracted text content")
    text_length: int = Field(default=0, description="Character count of extracted text")
    # Segment references
    segments: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Page/slide/timestamp segments with references. Each dict has keys like 'ref', 'text'."
    )
    # Metadata
    detected_language: Optional[str] = None
    title: Optional[str] = None
    transcript_language: Optional[str] = None
    mime_type: Optional[str] = None
    file_size_bytes: Optional[int] = None
    # Errors
    error: Optional[str] = None
    warnings: List[str] = Field(default_factory=list)


class ExtractionBundle(BaseModel):
    """Aggregated extraction results from all user-provided sources."""
    sources: List[ExtractedSource] = Field(default_factory=list)
    total_sources: int = 0
    successful_sources: int = 0
    failed_sources: int = 0
    combined_text_length: int = 0
    combined_text: str = Field(default="", description="Merged text from all successful sources with source labels")
    warnings: List[str] = Field(default_factory=list)

    def has_usable_evidence(self) -> bool:
        return self.successful_sources > 0 and self.combined_text_length > 30


# =============================================================================
# Stage B: Source Evidence Analysis Models
# =============================================================================

class EvidenceItem(BaseModel):
    """A single discovered item from source evidence with traceability."""
    item: str = Field(..., description="The discovered concept, word, rule, or structure")
    category: str = Field(default="general", description="e.g. vocabulary, grammar, expression, concept, cultural")
    source_ref: Optional[str] = Field(default=None, description="Which source this came from")
    evidence_excerpt: Optional[str] = Field(default=None, description="Verbatim excerpt supporting this finding")
    confidence: str = Field(default="medium", description="high, medium, low")


class SourceAnalysis(BaseModel):
    """Results of analyzing extracted source evidence for pedagogical content."""
    analysis_id: str = ""
    # What the source actually contains
    main_topics: List[str] = Field(default_factory=list, description="Primary instructional topics discovered")
    subtopics: List[str] = Field(default_factory=list, description="Supporting sub-concepts")
    # Linguistic findings
    vocabulary_items: List[EvidenceItem] = Field(default_factory=list)
    grammar_structures: List[EvidenceItem] = Field(default_factory=list)
    expressions_idioms: List[EvidenceItem] = Field(default_factory=list)
    example_sentences: List[EvidenceItem] = Field(default_factory=list)
    # Communicative context
    communicative_situations: List[str] = Field(default_factory=list)
    learning_outcomes_inferred: List[str] = Field(default_factory=list)
    # Observations
    pronunciation_observations: List[EvidenceItem] = Field(
        default_factory=list,
        description="Only include when supported by audio evidence"
    )
    cultural_context: List[str] = Field(default_factory=list)
    prerequisite_knowledge: List[str] = Field(default_factory=list)
    # Quality signals
    gaps: List[str] = Field(default_factory=list, description="Identified gaps in source coverage")
    ambiguities: List[str] = Field(default_factory=list, description="Contradictions or unclear points")
    source_coverage_summary: str = Field(default="", description="Brief narrative of what the source covers")
    evidence_density: str = Field(default="medium", description="high, medium, low - how rich the source is")

    def has_sufficient_evidence(self) -> bool:
        return len(self.main_topics) > 0 and (
            len(self.vocabulary_items) > 0 or
            len(self.grammar_structures) > 0 or
            len(self.expressions_idioms) > 0
        )


# =============================================================================
# Stage C: Dynamic Instruction Plan Models
# =============================================================================

class PlannedSection(BaseModel):
    """A dynamically selected section for the lesson output."""
    section_type: str = Field(..., description="e.g. vocabulary_table, grammar_explanation, dialogue, pronunciation, exercises, reading_passage")
    rationale: str = Field(default="", description="Why this section is included based on source evidence")
    key_content_points: List[str] = Field(default_factory=list, description="Specific items to cover in this section")
    source_evidence_refs: List[str] = Field(default_factory=list, description="Which evidence items support this section")


class PlannedExercise(BaseModel):
    """A dynamically planned exercise format."""
    exercise_type: str = Field(..., description="e.g. conjugation_drill, translation, error_correction, fill_blank, comprehension")
    target_concept: str = Field(default="", description="Which source concept this tests")
    difficulty: str = Field(default="appropriate", description="Relative to stated level")


class InstructionPlan(BaseModel):
    """Dynamic instruction plan generated from source analysis. This drives Gemini synthesis."""
    plan_id: str = ""
    # What to teach (derived from source)
    lesson_title: str = Field(default="", description="Descriptive title based on actual source content")
    lesson_focus: str = Field(default="", description="Primary instructional focus from evidence")
    concepts_to_explain: List[str] = Field(default_factory=list)
    source_examples_to_preserve: List[str] = Field(default_factory=list, description="Verbatim instructor examples worth keeping")
    additional_explanation_needed: List[str] = Field(default_factory=list, description="Gaps that need pedagogical bridging")
    prerequisite_bridges: List[str] = Field(default_factory=list, description="Prerequisites to briefly review")
    # How to structure the output
    planned_sections: List[PlannedSection] = Field(default_factory=list)
    planned_exercises: List[PlannedExercise] = Field(default_factory=list)
    # What NOT to include
    sections_excluded: List[str] = Field(default_factory=list, description="Sections omitted because source doesn't support them")
    unfillable_gaps: List[str] = Field(default_factory=list, description="Gaps that cannot be safely filled from evidence")
    # Context
    day_context: Optional[str] = None
    prior_lesson_overlap: List[str] = Field(default_factory=list, description="Concepts already covered in prior days")


# =============================================================================
# Stage E: Validation Report Models
# =============================================================================

class ValidationIssue(BaseModel):
    """A single validation finding."""
    issue_type: str = Field(..., description="e.g. unsupported_claim, incorrect_answer, missing_evidence, schema_error")
    severity: str = Field(default="warning", description="error, warning, info")
    description: str = ""
    field_path: Optional[str] = None
    suggestion: Optional[str] = None


class ValidationReport(BaseModel):
    """Results of evidence grounding and content validation."""
    is_valid: bool = True
    total_checks: int = 0
    passed_checks: int = 0
    issues: List[ValidationIssue] = Field(default_factory=list)
    evidence_coverage_ratio: Optional[float] = Field(
        default=None,
        description="Fraction of key claims that have source evidence. Not a calibrated probability."
    )
    warnings: List[str] = Field(default_factory=list)


# =============================================================================
# Stage F: Quality Evaluation Models
# =============================================================================

class QualityDimension(BaseModel):
    """Score for one quality dimension."""
    dimension: str
    meets_criteria: bool = True
    notes: str = ""


class QualityReport(BaseModel):
    """Quality evaluation of the final generated package."""
    overall_acceptable: bool = True
    dimensions: List[QualityDimension] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    recommendation: str = Field(default="accept", description="accept, revise, reject")
