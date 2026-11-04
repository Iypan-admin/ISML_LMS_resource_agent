"""
LangGraph Pipeline Orchestrator for ISML Intelligent Content Generation.

Defines the complete StateGraph with nodes, edges, and conditional routing.
Provides the main `run_content_pipeline()` entry point.

Pipeline Flow:
  START → enhance_prompt → analyze_sources → partition_sources 
        → generate_periods → validate_quality 
        → [if retry needed] → generate_periods (loop)
        → [if passed] → assemble_package → END
"""
from __future__ import annotations

import logging
import math
from typing import Optional, Any, List, Dict

from langgraph.graph import StateGraph, START, END

from app.graph.state import PipelineState
from app.graph.nodes import (
    enhance_prompt_node,
    analyze_sources_node,
    partition_sources_node,
    generate_periods_node,
    validate_quality_node,
    assemble_package_node,
    should_retry,
)

logger = logging.getLogger(__name__)


def build_content_pipeline() -> StateGraph:
    """
    Constructs the LangGraph StateGraph for the content generation pipeline.
    
    Graph structure:
    
        ┌──────────────┐
        │ enhance_prompt│
        └──────┬───────┘
               │
        ┌──────▼───────┐
        │analyze_sources│
        └──────┬───────┘
               │
        ┌──────▼────────┐
        │partition_sources│
        └──────┬────────┘
               │
        ┌──────▼───────────┐
        │generate_periods  │◄────┐
        └──────┬───────────┘     │
               │                 │
        ┌──────▼───────────┐     │
        │validate_quality  │     │
        └──────┬───────────┘     │
               │                 │
         ┌─────┴─────┐          │
         │should_retry│──retry──┘
         └─────┬─────┘
               │ assemble
        ┌──────▼───────────┐
        │assemble_package  │
        └──────┬───────────┘
               │
              END
    """
    graph = StateGraph(PipelineState)
    
    # Add all nodes
    graph.add_node("enhance_prompt", enhance_prompt_node)
    graph.add_node("analyze_sources", analyze_sources_node)
    graph.add_node("partition_sources", partition_sources_node)
    graph.add_node("generate_periods", generate_periods_node)
    graph.add_node("validate_quality", validate_quality_node)
    graph.add_node("assemble_package", assemble_package_node)
    
    # Define edges (linear flow)
    graph.add_edge(START, "enhance_prompt")
    graph.add_edge("enhance_prompt", "analyze_sources")
    graph.add_edge("analyze_sources", "partition_sources")
    graph.add_edge("partition_sources", "generate_periods")
    graph.add_edge("generate_periods", "validate_quality")
    
    # Conditional edge: retry failed periods or proceed to assembly
    graph.add_conditional_edges(
        "validate_quality",
        should_retry,
        {
            "retry": "generate_periods",
            "assemble": "assemble_package",
        }
    )
    
    # Final edge
    graph.add_edge("assemble_package", END)
    
    return graph


# Compile the graph once at module level for reuse
_compiled_pipeline = None


def get_compiled_pipeline():
    """Get or create the compiled pipeline graph."""
    global _compiled_pipeline
    if _compiled_pipeline is None:
        graph = build_content_pipeline()
        _compiled_pipeline = graph.compile()
        logger.info("✅ LangGraph content pipeline compiled successfully")
    return _compiled_pipeline


async def run_content_pipeline(
    session_id: str,
    language: str,
    level: str,
    topic: str,
    source_context: str = "",
    track_mode: str = "STANDARD",
    institution_type: str = "COLLEGE",
    course_duration_hours: Optional[int] = None,
    period_duration_minutes: Optional[int] = None,
    periods_per_week: Optional[int] = None,
    total_periods: Optional[int] = None,
    assessments_count: Optional[int] = None,
    user_prompt: str = "",
    periods_to_generate: Optional[list[int]] = None,
) -> dict:
    """
    Main entry point for the LangGraph content generation pipeline.
    
    Runs the full pipeline: enhance → analyze → partition → generate → validate → assemble
    
    Returns a dict with keys: session_plan, teacher_materials, student_lsrw
    (compatible with FullSessionPackageResult format)
    """
    # Resolve defaults
    is_school = institution_type == "SCHOOL"
    resolved_total = total_periods or (60 if is_school else 80)
    resolved_hours = course_duration_hours or resolved_total
    resolved_cadence = periods_per_week or (3 if is_school else 2)
    resolved_slot = period_duration_minutes or (40 if is_school else 60)
    resolved_assessments = assessments_count or 4
    
    # Determine how many periods to generate with LLM
    # Start with first batch (up to 10), more can be generated later
    if periods_to_generate is None:
        periods_to_generate = list(range(1, min(resolved_total + 1, 11)))
    
    # Build initial state
    initial_state: PipelineState = {
        "session_id": session_id,
        "language": language,
        "level": level,
        "topic": topic,
        "track_mode": track_mode,
        "institution_type": institution_type,
        "course_duration_hours": resolved_hours,
        "period_duration_minutes": resolved_slot,
        "periods_per_week": resolved_cadence,
        "total_periods": resolved_total,
        "assessments_count": resolved_assessments,
        "raw_source_context": source_context,
        "extracted_sources": [],
        "user_prompt": user_prompt or topic,
        "enhanced_master_prompt": "",
        "source_analysis": {},
        "source_partitions": [],
        "instruction_plan": {},
        "current_period": 1,
        "periods_to_generate": periods_to_generate,
        "generated_periods": [],
        "previously_covered_topics": [],
        "quality_reports": [],
        "retry_periods": [],
        "max_retries": 2,
        "session_plan": {},
        "teacher_materials": {},
        "student_lsrw": {},
        "pipeline_stage": "initialized",
        "error_log": [],
        "total_llm_calls": 0,
    }
    
    logger.info(
        f"🚀 Starting LangGraph content pipeline: session={session_id}, "
        f"lang={language}, level={level}, topic={topic}, "
        f"institution={institution_type}, periods={resolved_total}, "
        f"generating={len(periods_to_generate)} periods"
    )
    
    try:
        pipeline = get_compiled_pipeline()
        final_state = await pipeline.ainvoke(initial_state)
        
        logger.info(
            f"✅ Pipeline complete: {len(final_state.get('generated_periods', []))} periods generated, "
            f"{final_state.get('total_llm_calls', 0)} total LLM calls, "
            f"stage={final_state.get('pipeline_stage')}"
        )
        
        return {
            "session_plan": final_state.get("session_plan", {}),
            "teacher_materials": final_state.get("teacher_materials", {}),
            "student_lsrw": final_state.get("student_lsrw", {}),
            "pipeline_metadata": {
                "total_llm_calls": final_state.get("total_llm_calls", 0),
                "periods_generated": len(final_state.get("generated_periods", [])),
                "quality_reports": final_state.get("quality_reports", []),
                "error_log": final_state.get("error_log", []),
                "pipeline_stage": final_state.get("pipeline_stage", "unknown"),
                "source_analysis_summary": final_state.get("source_analysis", {}).get("source_coverage_summary", ""),
                "enhanced_prompt_preview": final_state.get("enhanced_master_prompt", "")[:200],
            },
        }
    except Exception as e:
        logger.error(f"❌ Pipeline failed: {e}", exc_info=True)
        raise ValueError(
            f"LangGraph content pipeline failed: {str(e)}. "
            f"Please ensure source materials are uploaded and try again."
        )
