"""
Pydantic data models for the ISML Continuous Knowledge Intelligence Engine.

Covers:
- Knowledge Claims (Subject-Predicate-Object triples)
- Contradiction Detection & Multi-source conflict reporting
- Hierarchical Vector Chunks & SimHash fingerprints
- Ingestion Sagaload & Query Contracts with Source Traceability
"""
from typing import List, Optional, Dict, Any, Literal
from enum import Enum
from pydantic import BaseModel, Field


class EpistemicStatus(str, Enum):
    FACT = "FACT"
    HYPOTHESIS = "HYPOTHESIS"
    OPINION = "OPINION"
    DEPRECATED = "DEPRECATED"


class ContradictionType(str, Enum):
    DIRECT_OPPOSITE = "DIRECT_OPPOSITE"
    NUMERICAL_DISCREPANCY = "NUMERICAL_DISCREPANCY"
    TEMPORAL_SUPERSEDENCE = "TEMPORAL_SUPERSEDENCE"
    NO_CONFLICT = "NO_CONFLICT"


class KnowledgeClaimModel(BaseModel):
    id: Optional[str] = None
    subject: str = Field(..., description="Core entity or grammatical/topical concept")
    predicate: str = Field(..., description="Relationship, rule, property, or assertion")
    object: str = Field(..., description="Value, complement, consequence, or target entity")
    epistemic_status: EpistemicStatus = EpistemicStatus.FACT
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    verbatim_quote: str = Field(..., description="Verbatim source quote supporting this claim")
    chunk_id: Optional[str] = None
    resource_id: Optional[str] = None
    session_id: Optional[str] = None
    source_title: Optional[str] = None


class ContradictionDetectionResult(BaseModel):
    has_conflict: bool
    conflict_type: ContradictionType = ContradictionType.NO_CONFLICT
    claim_a_id: Optional[str] = None
    claim_b_id: Optional[str] = None
    description: str = Field(default="", description="Detailed explanation of the semantic contradiction")
    resolution_guidance: Optional[str] = Field(
        default=None,
        description="Explanation of differing contexts, dates, or regional variations"
    )


class HierarchicalChunk(BaseModel):
    id: Optional[str] = None
    parent_chunk_id: Optional[str] = None
    chunk_index: int
    total_chunks: int = 1
    content: str
    token_count: int
    page_number: Optional[int] = None
    time_offset_sec: Optional[int] = None
    sim_hash: Optional[str] = None
    source_title: str
    source_type: str
    language: Optional[str] = None
    cefr_level: Optional[str] = None
    claims: List[KnowledgeClaimModel] = Field(default_factory=list)


class KnowledgeIngestRequest(BaseModel):
    source_url: Optional[str] = None
    file_path: Optional[str] = None
    source_title: str
    source_type: str = Field(default="DOCUMENT", description="DOCUMENT, WEB_SCRAPE, YOUTUBE, AUDIO")
    language: Optional[str] = "German"
    cefr_level: Optional[str] = "A1"
    resource_id: Optional[str] = None
    session_id: Optional[str] = None


class KnowledgeIngestResponse(BaseModel):
    status: Literal["QUEUED", "PROCESSING", "COMPLETED", "FAILED", "DUPLICATE_SKIPPED"]
    job_id: str
    resource_id: Optional[str] = None
    source_title: str
    total_chunks: int = 0
    total_claims: int = 0
    detected_conflicts_count: int = 0
    duplicate_action: Optional[str] = None
    error: Optional[str] = None
    message: str


class GroundedCitation(BaseModel):
    source_title: str
    source_id: Optional[str] = None
    chunk_id: str
    page_number: Optional[int] = None
    time_offset_sec: Optional[int] = None
    supporting_excerpt: str
    relevance_score: float = 0.0


class KnowledgeQueryRequest(BaseModel):
    query: str = Field(..., description="Natural language question")
    target_language: Optional[str] = None
    target_resource_id: Optional[str] = None
    top_k: int = Field(default=8, ge=1, le=25)
    include_contradictions: bool = True


class KnowledgeQueryResponse(BaseModel):
    query: str
    intent_summary: str
    answer: str
    citations: List[GroundedCitation] = Field(default_factory=list)
    identified_contradictions: List[str] = Field(default_factory=list)
    faithfulness_score: float = Field(default=1.0, ge=0.0, le=1.0)
    retrieval_method: str = "HYBRID_RRF_CROSS_ENCODER"

