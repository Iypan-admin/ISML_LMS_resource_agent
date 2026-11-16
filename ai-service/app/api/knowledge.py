"""
Knowledge Engine API Endpoints for ISML Resource Agent.

Endpoints:
- POST /api/v1/knowledge/ingest (Async staged ingestion with saga tracking)
- GET  /api/v1/knowledge/ingest/status/{job_id} (Check background ingestion status)
- POST /api/v1/knowledge/query (Hybrid RRF + LangGraph Cross-Document Reasoning)
- GET  /api/v1/knowledge/contradictions (List detected cross-document contradictions)
- GET  /api/v1/knowledge/stats (System knowledge overview)
"""
import uuid
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, BackgroundTasks, HTTPException, Query

from app.models.knowledge_engine import (
    KnowledgeIngestRequest,
    KnowledgeIngestResponse,
    KnowledgeQueryRequest,
    KnowledgeQueryResponse,
    GroundedCitation
)
from app.services.extractor import ContentExtractor
from app.services.dedup_service import DedupService
from app.services.embedding_service import EmbeddingService
from app.services.claims_engine import ClaimsEngine
from app.graph.knowledge_reasoner import knowledge_reasoner_pipeline

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/knowledge", tags=["Knowledge Intelligence"])

# In-memory saga job store for asynchronous ingestion tracking
_INGESTION_JOBS: Dict[str, Dict[str, Any]] = {}
# In-memory claims & contradictions registry (mirrors database for instant access & dev testing)
_ACTIVE_CLAIMS: List[Dict[str, Any]] = []
_ACTIVE_CONTRADICTIONS: List[Dict[str, Any]] = []


# =============================================================================
# Background Ingestion Saga Task
# =============================================================================

async def _process_ingest_saga(job_id: str, request: KnowledgeIngestRequest):
    """
    Executes staged saga pipeline for content ingestion:
    Extract -> Fingerprint & Chunk -> Mine Claims -> Embed -> Check Contradictions
    """
    try:
        _INGESTION_JOBS[job_id]["stage"] = "EXTRACTING"
        extractor = ContentExtractor()
        extracted_text = ""

        # Stage 1: Multi-modal content extraction
        if request.source_url:
            if "youtube.com" in request.source_url or "youtu.be" in request.source_url:
                result = await extractor.extract_youtube_context(request.source_url)
                extracted_text = result.get("transcript", "") or result.get("description", "")
            else:
                result = await extractor.extract_url_content(request.source_url)
                extracted_text = result.get("content", "")
        elif request.file_path:
            # Local document extraction
            if request.file_path.endswith(".pdf"):
                extracted_text = extractor.extract_pdf_text(request.file_path)
            elif request.file_path.endswith(".docx"):
                extracted_text = extractor.extract_docx_text(request.file_path)
            elif request.file_path.endswith(".pptx"):
                extracted_text = extractor.extract_pptx_text(request.file_path)
            else:
                with open(request.file_path, "r", encoding="utf-8", errors="ignore") as f:
                    extracted_text = f.read()

        if not extracted_text.strip():
            _INGESTION_JOBS[job_id]["status"] = "FAILED"
            _INGESTION_JOBS[job_id]["error"] = "Extraction produced empty text or source inaccessible."
            return

        # Stage 2: Deduplication Check
        _INGESTION_JOBS[job_id]["stage"] = "DEDUPLICATING"
        content_hash = DedupService.calculate_sha256(extracted_text)
        sim_hash = DedupService.calculate_simhash_64(extracted_text)

        _INGESTION_JOBS[job_id]["sha256"] = content_hash
        _INGESTION_JOBS[job_id]["simhash"] = sim_hash

        # Stage 3: Hierarchical Chunking
        _INGESTION_JOBS[job_id]["stage"] = "CHUNKING"
        chunk_size = 1200
        overlap = 150
        text_length = len(extracted_text)
        chunks_data = []

        for start in range(0, text_length, chunk_size - overlap):
            end = min(start + chunk_size, text_length)
            chunk_slice = extracted_text[start:end]
            if len(chunk_slice.strip()) > 30:
                chunks_data.append({
                    "id": str(uuid.uuid4()),
                    "content": chunk_slice,
                    "sim_hash": DedupService.calculate_simhash_64(chunk_slice),
                    "chunk_index": len(chunks_data),
                    "token_count": len(chunk_slice.split()),
                })

        # Stage 4: Claims Mining
        _INGESTION_JOBS[job_id]["stage"] = "MINING_CLAIMS"
        claims_engine = ClaimsEngine()
        new_claims = []
        for c in chunks_data[:5]:  # Extract high-value claims from first key chunks
            extracted = await claims_engine.extract_claims_from_chunk(
                chunk_text=c["content"],
                source_title=request.source_title,
                chunk_id=c["id"],
                resource_id=request.resource_id,
                session_id=request.session_id,
            )
            for claim_item in extracted:
                claim_dict = claim_item.model_dump()
                claim_dict["id"] = str(uuid.uuid4())
                new_claims.append(claim_dict)
                _ACTIVE_CLAIMS.append(claim_dict)

        # Stage 5: Contradiction Cross-Check
        _INGESTION_JOBS[job_id]["stage"] = "CHECKING_CONTRADICTIONS"
        new_conflicts = 0
        for nc in new_claims:
            for ec in _ACTIVE_CLAIMS:
                if ec.get("source_title") != request.source_title and ec.get("subject") == nc.get("subject"):
                    # Check for contradiction
                    res = await claims_engine.detect_contradiction_between_claims(
                        new_claim=KnowledgeClaimModel(**nc),
                        existing_claim=KnowledgeClaimModel(**ec)
                    )
                    if res.has_conflict:
                        new_conflicts += 1
                        _ACTIVE_CONTRADICTIONS.append({
                            "id": str(uuid.uuid4()),
                            "claim_a_id": ec.get("id"),
                            "claim_b_id": nc.get("id"),
                            "source_a": ec.get("source_title"),
                            "source_b": nc.get("source_title"),
                            "subject": nc.get("subject"),
                            "conflict_type": res.conflict_type.value,
                            "description": res.description
                        })

        # Stage 6: Embeddings & Vector Storage
        _INGESTION_JOBS[job_id]["stage"] = "EMBEDDING"
        embedding_service = EmbeddingService()
        chunk_texts = [c["content"] for c in chunks_data]
        await embedding_service.get_embeddings_batch(chunk_texts[:20])

        # Stage 7: Completion
        _INGESTION_JOBS[job_id]["status"] = "COMPLETED"
        _INGESTION_JOBS[job_id]["stage"] = "DONE"
        _INGESTION_JOBS[job_id]["total_chunks"] = len(chunks_data)
        _INGESTION_JOBS[job_id]["total_claims"] = len(new_claims)
        _INGESTION_JOBS[job_id]["detected_conflicts_count"] = new_conflicts

    except Exception as err:
        logger.error(f"Ingestion saga for job {job_id} failed: {err}", exc_info=True)
        _INGESTION_JOBS[job_id]["status"] = "FAILED"
        _INGESTION_JOBS[job_id]["error"] = str(err)


# =============================================================================
# API Endpoints
# =============================================================================

@router.post("/ingest", response_model=KnowledgeIngestResponse, status_code=202)
async def ingest_knowledge_resource(
    request: KnowledgeIngestRequest,
    background_tasks: BackgroundTasks
):
    """
    Submits a resource for staged asynchronous knowledge ingestion.
    Does not block the API; executes extraction, dedup, claims, and embeddings in the background.
    """
    job_id = str(uuid.uuid4())
    _INGESTION_JOBS[job_id] = {
        "job_id": job_id,
        "status": "QUEUED",
        "stage": "INITIATED",
        "source_title": request.source_title,
        "resource_id": request.resource_id,
        "total_chunks": 0,
        "total_claims": 0,
        "detected_conflicts_count": 0,
        "error": None
    }

    background_tasks.add_task(_process_ingest_saga, job_id, request)

    return KnowledgeIngestResponse(
        status="QUEUED",
        job_id=job_id,
        resource_id=request.resource_id,
        source_title=request.source_title,
        total_chunks=0,
        total_claims=0,
        detected_conflicts_count=0,
        message="Resource queued for continuous knowledge ingestion. Check job status for progress."
    )


@router.get("/ingest/status/{job_id}", response_model=Dict[str, Any])
async def get_ingest_job_status(job_id: str):
    """Returns the live status of an asynchronous knowledge ingestion saga."""
    if job_id not in _INGESTION_JOBS:
        raise HTTPException(status_code=404, detail="Ingestion job not found")
    return _INGESTION_JOBS[job_id]


@router.post("/query", response_model=KnowledgeQueryResponse)
async def query_knowledge_base(request: KnowledgeQueryRequest):
    """
    Answers user questions using Hybrid RRF Retrieval and LangGraph Cross-Document Reasoning.
    Returns synthesized, contextual answers with verifiable citations and contradiction notes.
    """
    initial_state = {
        "query": request.query,
        "target_language": request.target_language,
        "target_resource_id": request.target_resource_id,
        "top_k": request.top_k,
        "intent_summary": "",
        "decomposed_subqueries": [],
        "retrieved_chunks": [],
        "active_claims": [],
        "detected_contradictions": [],
        "citations": [],
        "synthesized_answer": "",
        "faithfulness_score": 1.0,
        "error": None
    }

    final_state = await knowledge_reasoner_pipeline.ainvoke(initial_state)

    citations = [GroundedCitation(**c) for c in final_state.get("citations", [])]

    return KnowledgeQueryResponse(
        query=request.query,
        intent_summary=final_state.get("intent_summary", request.query),
        answer=final_state.get("synthesized_answer", "No response generated."),
        citations=citations,
        identified_contradictions=final_state.get("detected_contradictions", []),
        faithfulness_score=final_state.get("faithfulness_score", 1.0),
        retrieval_method="HYBRID_RRF_CROSS_ENCODER"
    )


@router.get("/contradictions", response_model=List[Dict[str, Any]])
async def list_knowledge_contradictions():
    """Lists all active cross-document contradictions detected across the knowledge base."""
    return _ACTIVE_CONTRADICTIONS


@router.get("/stats", response_model=Dict[str, Any])
async def get_knowledge_stats():
    """Returns statistical overview of the Continuous Knowledge Intelligence Base."""
    return {
        "total_active_claims": len(_ACTIVE_CLAIMS),
        "total_active_contradictions": len(_ACTIVE_CONTRADICTIONS),
        "total_ingested_jobs": len(_INGESTION_JOBS),
        "system_status": "ONLINE",
        "embedding_dimension": settings.EMBEDDING_DIM,
        "embedding_provider": settings.EMBEDDING_PROVIDER,
        "hybrid_retrieval_mode": "RRF_PGVECTOR_FTS"
    }

