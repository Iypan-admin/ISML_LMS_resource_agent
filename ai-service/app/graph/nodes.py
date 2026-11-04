"""
LangGraph Node Implementations for the ISML Intelligent Content Pipeline.

Each node is an async function that:
1. Reads relevant fields from PipelineState
2. Performs its computation (usually involving an LLM call)
3. Returns a dict of state fields to update

Node Graph Flow:
  enhance_prompt → analyze_sources → partition_sources → generate_periods → validate_quality → [conditional] → assemble_package
"""
from __future__ import annotations

import json
import logging
import math
from typing import Any, Optional, Dict, List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableConfig

from app.config.settings import settings
from app.graph.state import PipelineState, SourceChunk, PeriodContent, QualityReport
from app.graph.prompts import (
    PROMPT_ENGINEER_TEMPLATE,
    SOURCE_ANALYSIS_TEMPLATE,
    SOURCE_PARTITION_TEMPLATE,
    PERIOD_GENERATION_TEMPLATE,
    QUALITY_VALIDATION_TEMPLATE,
    REFINEMENT_TEMPLATE,
)

logger = logging.getLogger(__name__)


def _get_llm(temperature: float = 0.3, max_tokens: int = 8192) -> ChatGoogleGenerativeAI:
    """Create a ChatGoogleGenerativeAI instance with the configured model."""
    return ChatGoogleGenerativeAI(
        model=settings.LLM_MODEL or "gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=temperature,
        max_output_tokens=max_tokens,
        timeout=10.0,
        max_retries=1,
    )


def _get_llm_json(temperature: float = 0.2, max_tokens: int = 8192) -> ChatGoogleGenerativeAI:
    """Create a ChatGoogleGenerativeAI configured for JSON output."""
    return ChatGoogleGenerativeAI(
        model=settings.LLM_MODEL or "gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=temperature,
        max_output_tokens=max_tokens,
        timeout=10.0,
        max_retries=1,
        model_kwargs={"response_mime_type": "application/json"},
    )


def _safe_json_parse(text: str) -> dict | None:
    """Parse JSON from LLM output, handling markdown fences and common issues."""
    clean = text.strip()
    if clean.startswith("```json"):
        clean = clean[7:]
    if clean.startswith("```"):
        clean = clean[3:]
    if clean.endswith("```"):
        clean = clean[:-3]
    clean = clean.strip()
    try:
        return json.loads(clean, strict=False)
    except json.JSONDecodeError:
        import re
        repaired = re.sub(r'\\(?![/"\\bfnrtu]|u[0-9a-fA-F]{4})', r'\\\\', clean)
        try:
            return json.loads(repaired, strict=False)
        except json.JSONDecodeError:
            match = re.search(r'(\{[\s\S]*\})', clean)
            if match:
                try:
                    return json.loads(match.group(1), strict=False)
                except json.JSONDecodeError:
                    pass
    return None


# =============================================================================
# NODE 1: PROMPT ENHANCEMENT
# =============================================================================
async def enhance_prompt_node(state: PipelineState, config: RunnableConfig) -> dict:
    """
    Takes the raw user prompt and transforms it into a professional-grade
    master prompt using LLM-powered prompt engineering.
    """
    logger.info("🧠 [Node 1/6] Enhancing user prompt with Master Prompt Engineer...")

    user_prompt = state.get("user_prompt") or state.get("topic", "")
    source_text = state.get("raw_source_context", "")

    source_summary = "No source materials uploaded."
    if source_text and len(source_text.strip()) > 50:
        source_lines = source_text.split('\n')
        source_labels = [l for l in source_lines if l.strip().startswith('[')][:10]
        word_count = len(source_text.split())
        source_summary = (
            f"Source materials available: {len(source_labels)} items, ~{word_count} words total.\n"
            f"Sources: {chr(10).join(source_labels[:5])}"
        )

    try:
        llm = _get_llm(temperature=0.4, max_tokens=2048)
        chain = PROMPT_ENGINEER_TEMPLATE | llm | StrOutputParser()

        enhanced = await chain.ainvoke({
            "user_prompt": user_prompt,
            "language": state["language"],
            "level": state["level"],
            "topic": state["topic"],
            "institution_type": state.get("institution_type", "COLLEGE"),
            "total_periods": state.get("total_periods", 80),
            "period_duration_minutes": state.get("period_duration_minutes", 60),
            "periods_per_week": state.get("periods_per_week", 2),
            "source_summary": source_summary,
        })

        logger.info(f"✅ Prompt enhanced: {len(enhanced)} chars (from {len(user_prompt)} chars)")
        return {
            "enhanced_master_prompt": enhanced,
            "pipeline_stage": "prompt_enhanced",
            "total_llm_calls": state.get("total_llm_calls", 0) + 1,
        }
    except Exception as e:
        logger.warning(f"Prompt enhancement failed, using original: {e}")
        enhanced_fallback = (
            f"Generate comprehensive, source-grounded educational content for {state['language']} "
            f"({state['level']}) on '{state['topic']}'. Each period must have unique vocabulary, "
            f"grammar focus, dialogues, and exercises. All content must derive from uploaded source "
            f"materials. Include IPA pronunciation, verified exercise answers, and progressive "
            f"difficulty scaffolding. Original request: {user_prompt}"
        )
        return {
            "enhanced_master_prompt": enhanced_fallback,
            "pipeline_stage": "prompt_enhanced_fallback",
            "error_log": [f"Prompt enhancement fallback: {str(e)}"],
            "total_llm_calls": state.get("total_llm_calls", 0),
        }


# =============================================================================
# NODE 2: SOURCE ANALYSIS
# =============================================================================
async def analyze_sources_node(state: PipelineState, config: RunnableConfig) -> dict:
    """Deep analysis of source materials using LLM to discover all teachable content."""
    logger.info("🔍 [Node 2/6] Analyzing source materials with deep thinking...")

    source_text = state.get("raw_source_context", "")

    if not source_text or len(source_text.strip()) < 50:
        logger.warning("No substantial source material for analysis.")
        return {
            "source_analysis": {
                "main_topics": [state["topic"]],
                "vocabulary_items": [],
                "grammar_structures": [],
                "expressions_idioms": [],
                "evidence_density": "none",
                "source_coverage_summary": "No source material provided.",
                "total_teachable_items": 0,
                "estimated_periods_coverage": 0,
                "gaps": ["No source material uploaded"],
            },
            "pipeline_stage": "sources_analyzed_empty",
            "total_llm_calls": state.get("total_llm_calls", 0),
        }

    truncated_source = source_text[:60000]

    try:
        llm = _get_llm_json(temperature=0.1, max_tokens=8192)
        chain = SOURCE_ANALYSIS_TEMPLATE | llm | StrOutputParser()

        raw_result = await chain.ainvoke({
            "language": state["language"],
            "level": state["level"],
            "topic": state["topic"],
            "source_text": truncated_source,
        })

        parsed = _safe_json_parse(raw_result)
        if not parsed:
            raise ValueError("Failed to parse source analysis JSON")

        total_items = (
            len(parsed.get("vocabulary_items", [])) +
            len(parsed.get("grammar_structures", [])) +
            len(parsed.get("expressions_idioms", []))
        )
        parsed["total_teachable_items"] = total_items

        logger.info(
            f"✅ Source analysis: {len(parsed.get('vocabulary_items', []))} vocab, "
            f"{len(parsed.get('grammar_structures', []))} grammar, "
            f"density={parsed.get('evidence_density')}"
        )

        return {
            "source_analysis": parsed,
            "pipeline_stage": "sources_analyzed",
            "total_llm_calls": state.get("total_llm_calls", 0) + 1,
        }
    except Exception as e:
        logger.error(f"Source analysis failed: {e}")
        return {
            "source_analysis": {
                "main_topics": [state["topic"]],
                "vocabulary_items": [],
                "grammar_structures": [],
                "expressions_idioms": [],
                "evidence_density": "unknown",
                "source_coverage_summary": f"Analysis failed: {str(e)}",
                "total_teachable_items": 0,
                "estimated_periods_coverage": 0,
                "gaps": [f"Analysis error: {str(e)}"],
            },
            "pipeline_stage": "sources_analyzed_error",
            "error_log": [f"Source analysis error: {str(e)}"],
            "total_llm_calls": state.get("total_llm_calls", 0) + 1,
        }


# =============================================================================
# NODE 3: SOURCE PARTITIONING
# =============================================================================
async def partition_sources_node(state: PipelineState, config: RunnableConfig) -> dict:
    """Distributes analyzed source evidence across periods for unique content per period."""
    logger.info("📦 [Node 3/6] Partitioning source evidence across periods...")

    analysis = state.get("source_analysis", {})
    periods_to_gen = state.get("periods_to_generate", list(range(1, 11)))
    num_periods = len(periods_to_gen)

    vocab_items = analysis.get("vocabulary_items", [])
    grammar_items = analysis.get("grammar_structures", [])
    expressions = analysis.get("expressions_idioms", [])

    if not vocab_items and not grammar_items:
        logger.warning("No evidence to partition. Creating topic-based partitions.")
        partitions = []
        for i, period_num in enumerate(periods_to_gen):
            partitions.append({
                "chunk_id": f"chunk_{period_num}",
                "period_number": period_num,
                "content": "",
                "vocab_items": [],
                "grammar_points": [],
                "expressions": [],
                "source_names": [],
                "period_theme": f"{state['topic']} — Unit {period_num}",
                "vocabulary_assignments": [],
                "grammar_focus": f"{state['topic']} Core Foundations {period_num}",
                "expression_assignments": [],
                "learning_objective": f"Core foundations for {state['topic']} in {state['language']}",
                "exercise_types": ["fill_blank", "translation"],
                "dialogue_scenario": f"Basic conversation about {state['topic']}",
                "source_excerpts_to_use": [],
            })
        return {
            "source_partitions": partitions,
            "pipeline_stage": "sources_partitioned_minimal",
            "total_llm_calls": state.get("total_llm_calls", 0),
        }

    # Try LLM-based intelligent partitioning
    try:
        llm = _get_llm_json(temperature=0.15, max_tokens=4096)
        chain = SOURCE_PARTITION_TEMPLATE | llm | StrOutputParser()

        compact_analysis = json.dumps({
            "vocabulary_items": vocab_items[:50],
            "grammar_structures": grammar_items[:20],
            "expressions_idioms": expressions[:20],
            "main_topics": analysis.get("main_topics", []),
        }, ensure_ascii=False, indent=1)

        raw_result = await chain.ainvoke({
            "num_periods": num_periods,
            "language": state["language"],
            "level": state["level"],
            "topic": state["topic"],
            "analysis_json": compact_analysis,
            "previously_covered": json.dumps(state.get("previously_covered_topics", []), ensure_ascii=False),
        })

        parsed = _safe_json_parse(raw_result)
        if parsed and "partitions" in parsed:
            partitions = parsed["partitions"]
            # Ensure each partition has required fields
            for p in partitions:
                p.setdefault("chunk_id", f"chunk_{p.get('period_number', 0)}")
                p.setdefault("content", "")
                p.setdefault("vocab_items", p.get("vocabulary_assignments", []))
                p.setdefault("grammar_points", [p.get("grammar_focus", "")])
                p.setdefault("expressions", p.get("expression_assignments", []))
                p.setdefault("source_names", [])
                p.setdefault("vocabulary_assignments", p.get("vocab_items", []))
                p.setdefault("grammar_focus", p.get("grammar_points", [""])[0] if p.get("grammar_points") else "")
                p.setdefault("expression_assignments", p.get("expressions", []))
                p.setdefault("exercise_types", ["fill_blank", "translation"])
                p.setdefault("dialogue_scenario", f"Conversation about {p.get('period_theme', state['topic'])}")
                p.setdefault("learning_objective", f"Master {p.get('period_theme', state['topic'])}")
                p.setdefault("source_excerpts_to_use", [])
            logger.info(f"✅ LLM partitioned evidence into {len(partitions)} period chunks")
            return {
                "source_partitions": partitions,
                "pipeline_stage": "sources_partitioned",
                "total_llm_calls": state.get("total_llm_calls", 0) + 1,
            }
        else:
            raise ValueError("Invalid partition JSON structure")
    except Exception as e:
        logger.warning(f"LLM partitioning failed, using algorithmic distribution: {e}")

    # Algorithmic fallback: round-robin distribution
    partitions = []
    for i, period_num in enumerate(periods_to_gen):
        vocab_per = max(3, len(vocab_items) // num_periods)
        start_v = i * vocab_per
        pv = vocab_items[start_v:start_v + vocab_per]

        grammar_per = max(1, len(grammar_items) // num_periods)
        start_g = i * grammar_per
        pg = grammar_items[start_g:start_g + grammar_per]

        expr_per = max(1, len(expressions) // num_periods) if expressions else 0
        start_e = i * expr_per
        pe = expressions[start_e:start_e + expr_per] if expressions else []

        def _extract_name(item, key1, key2="item"):
            if isinstance(item, dict):
                return item.get(key1, item.get(key2, str(item)))
            return str(item)

        partitions.append({
            "chunk_id": f"chunk_{period_num}",
            "period_number": period_num,
            "content": "",
            "vocab_items": [_extract_name(v, "word") for v in pv],
            "grammar_points": [_extract_name(g, "pattern") for g in pg],
            "expressions": [_extract_name(e, "expression") for e in pe],
            "source_names": [],
            "period_theme": f"{state['topic']} — {_extract_name(pg[0], 'pattern') if pg else f'Unit {period_num}'}",
            "vocabulary_assignments": [_extract_name(v, "word") for v in pv],
            "grammar_focus": _extract_name(pg[0], "pattern") if pg else f"Grammar Unit {period_num}",
            "expression_assignments": [_extract_name(e, "expression") for e in pe],
            "dialogue_scenario": f"Conversational application of Unit {period_num} concepts",
            "exercise_types": ["fill_blank", "translation", "error_correction", "sentence_construction"],
            "learning_objective": f"Master {_extract_name(pg[0], 'pattern') if pg else 'core concepts'} with application",
            "source_excerpts_to_use": [],
        })

    logger.info(f"✅ Algorithmic partitioning: {len(partitions)} chunks")
    return {
        "source_partitions": partitions,
        "pipeline_stage": "sources_partitioned_algorithmic",
        "total_llm_calls": state.get("total_llm_calls", 0),
    }


# =============================================================================
# NODE 4: PERIOD CONTENT GENERATION
# =============================================================================
async def generate_periods_node(state: PipelineState, config: RunnableConfig) -> dict:
    """Generates content for each period with individual LLM calls."""
    logger.info("✍️ [Node 4/6] Generating period content with per-period LLM calls...")

    partitions = state.get("source_partitions", [])
    enhanced_prompt = state.get("enhanced_master_prompt", state.get("topic", ""))
    source_text = state.get("raw_source_context", "")
    previously_covered = list(state.get("previously_covered_topics", []))
    total_periods = state.get("total_periods", 80)
    periods_per_week = state.get("periods_per_week", 2)
    retry_periods = state.get("retry_periods", [])

    # If retrying, only regenerate failed periods
    if retry_periods:
        partitions = [p for p in partitions if p.get("period_number") in retry_periods]
        logger.info(f"🔄 Retrying {len(partitions)} failed periods: {retry_periods}")

    llm = _get_llm_json(temperature=0.35, max_tokens=16384)
    chain = PERIOD_GENERATION_TEMPLATE | llm | StrOutputParser()

    generated_periods = []
    new_topics = []
    llm_calls = 0

    for partition in partitions:
        period_num = partition.get("period_number", 1)
        week_num = math.ceil(period_num / periods_per_week)
        period_in_week = ((period_num - 1) % periods_per_week) + 1

        source_chunk = ""
        if source_text:
            chunk_size = max(1, len(source_text) // max(len(state.get("source_partitions", [1])), 1))
            idx = next((i for i, p in enumerate(state.get("source_partitions", [])) if p.get("period_number") == period_num), 0)
            start = idx * chunk_size
            source_chunk = source_text[start:start + chunk_size][:8000]

        # Get generation attempt number
        existing = [p for p in state.get("generated_periods", []) if p.get("period_number") == period_num]
        attempt = (existing[0].get("generation_attempt", 1) + 1) if existing else 1

        try:
            raw_result = await chain.ainvoke({
                "period_number": period_num,
                "total_periods": total_periods,
                "enhanced_prompt": enhanced_prompt,
                "language": state["language"],
                "level": state["level"],
                "topic": state["topic"],
                "institution_type": state.get("institution_type", "COLLEGE"),
                "period_minutes": state.get("period_duration_minutes", 60),
                "week_number": week_num,
                "period_in_week": period_in_week,
                "periods_per_week": periods_per_week,
                "course_hours": state.get("course_duration_hours", total_periods),
                "period_theme": partition.get("period_theme", f"Unit {period_num}"),
                "assigned_vocabulary": json.dumps(partition.get("vocabulary_assignments", partition.get("vocab_items", [])), ensure_ascii=False),
                "grammar_focus": partition.get("grammar_focus", f"Grammar Unit {period_num}"),
                "assigned_expressions": json.dumps(partition.get("expression_assignments", partition.get("expressions", [])), ensure_ascii=False),
                "dialogue_scenario": partition.get("dialogue_scenario", f"Conversational practice"),
                "exercise_types": json.dumps(partition.get("exercise_types", ["fill_blank", "translation"]), ensure_ascii=False),
                "source_excerpts": json.dumps(partition.get("source_excerpts_to_use", [])[:3], ensure_ascii=False),
                "learning_objective": partition.get("learning_objective", f"Master Unit {period_num}"),
                "previously_covered": json.dumps((previously_covered + new_topics)[-20:], ensure_ascii=False),
                "source_evidence_chunk": source_chunk,
            })

            parsed = _safe_json_parse(raw_result)
            if parsed:
                period_content: PeriodContent = {
                    "period_number": period_num,
                    "day_topic": parsed.get("day_topic", f"Period {period_num}: {partition.get('period_theme', state['topic'])}"),
                    "grammar_rules_detail": parsed.get("grammar_rules_detail", ""),
                    "study_notes_markdown": parsed.get("study_notes_markdown", ""),
                    "vocabulary_bank": parsed.get("vocabulary_bank", []),
                    "classroom_dialogues": parsed.get("classroom_dialogues", []),
                    "pedagogical_instructions": parsed.get("pedagogical_instructions", ""),
                    "video_breakdown_analysis": parsed.get("video_breakdown_analysis", "Based on uploaded source materials."),
                    "in_class_exercises": parsed.get("in_class_exercises", []),
                    "exercise_solutions": parsed.get("exercise_solutions", []),
                    "homework_tasks": parsed.get("homework_tasks", []),
                    "quality_score": 0.0,
                    "generation_attempt": attempt,
                    "source_grounding_score": 0.0,
                }
                generated_periods.append(period_content)
                new_topics.append(parsed.get("day_topic", f"Period {period_num}"))
                logger.info(f"  ✅ Period {period_num} generated (attempt {attempt}): {parsed.get('day_topic', 'untitled')}")
            else:
                logger.warning(f"  ⚠️ Period {period_num}: JSON parse failed")
                generated_periods.append(_build_fallback_period(period_num, partition, state))
        except Exception as e:
            logger.error(f"  ❌ Period {period_num} generation failed: {e}")
            generated_periods.append(_build_fallback_period(period_num, partition, state))

        llm_calls += 1

    logger.info(f"✅ Generated {len(generated_periods)} periods with {llm_calls} LLM calls")

    return {
        "generated_periods": generated_periods,
        "previously_covered_topics": new_topics,
        "pipeline_stage": "periods_generated",
        "total_llm_calls": state.get("total_llm_calls", 0) + llm_calls,
        "retry_periods": [],  # Clear retry list after generation
    }


def _build_fallback_period(period_num: int, partition: dict, state: dict) -> PeriodContent:
    """Build a minimal fallback period when LLM generation fails."""
    return {
        "period_number": period_num,
        "day_topic": f"Period {period_num}: {partition.get('period_theme', state.get('topic', ''))}",
        "grammar_rules_detail": f"Grammar focus: {partition.get('grammar_focus', state.get('topic', ''))} (AI generation unavailable)",
        "study_notes_markdown": f"### Study Guide: Period {period_num}\n\nSource evidence available for: {', '.join(partition.get('vocab_items', [])[:5])}",
        "vocabulary_bank": [
            {"word": w, "meaning": "From source analysis", "pronunciation": f"/{w.lower()}/", "example_sentence": f"Example with {w}."}
            for w in partition.get("vocab_items", [])[:5]
        ],
        "classroom_dialogues": [f"[Dialogue for {partition.get('period_theme', '')} requires AI generation]"],
        "pedagogical_instructions": f"Focus on: {', '.join(partition.get('vocab_items', [])[:5])}",
        "video_breakdown_analysis": "Based on uploaded source materials.",
        "in_class_exercises": [f"Practice exercise for {partition.get('grammar_focus', state.get('topic', ''))}"],
        "exercise_solutions": [{"question": "Exercise", "answer": "[Requires AI]", "explanation": "Source-based"}],
        "homework_tasks": [f"Review vocabulary for Period {period_num}"],
        "quality_score": 0.0,
        "generation_attempt": 1,
        "source_grounding_score": 0.0,
    }


# =============================================================================
# NODE 5: QUALITY VALIDATION
# =============================================================================
async def validate_quality_node(state: PipelineState, config: RunnableConfig) -> dict:
    """Validates generated period content against quality standards."""
    logger.info("🔎 [Node 5/6] Validating content quality...")

    generated = state.get("generated_periods", [])
    source_text = state.get("raw_source_context", "")
    quality_reports = []
    retry_periods = []

    previous_topics = []

    for period in generated:
        period_num = period.get("period_number", 0)
        issues = []
        score = 10.0

        # Completeness checks
        if not period.get("study_notes_markdown") or len(period.get("study_notes_markdown", "")) < 200:
            issues.append("Study notes too short or missing")
            score -= 2.0
        if not period.get("vocabulary_bank") or len(period.get("vocabulary_bank", [])) < 2:
            issues.append("Vocabulary bank empty or too small")
            score -= 1.5
        if not period.get("exercise_solutions") or len(period.get("exercise_solutions", [])) < 2:
            issues.append("Exercise solutions insufficient")
            score -= 1.5
        if not period.get("classroom_dialogues") or len(period.get("classroom_dialogues", [])) < 2:
            issues.append("Dialogues missing or incomplete")
            score -= 1.0

        # Placeholder check
        content_str = json.dumps(period, ensure_ascii=False)
        for marker in ["[TBD]", "continue similarly", "insert here", "[Answer requires"]:
            if marker.lower() in content_str.lower():
                issues.append(f"Contains placeholder: '{marker}'")
                score -= 2.0

        # Uniqueness check
        current_topic = period.get("day_topic", "")
        for prev_topic in previous_topics:
            if prev_topic and current_topic and prev_topic.lower() == current_topic.lower():
                issues.append(f"Duplicate topic: {prev_topic}")
                score -= 3.0
        previous_topics.append(current_topic)

        # Source grounding heuristic
        source_grounding = 5.0
        if source_text and len(source_text) > 100:
            vocab_words = [v.get("word", "") for v in period.get("vocabulary_bank", []) if isinstance(v, dict)]
            source_lower = source_text.lower()
            grounded = sum(1 for w in vocab_words if w.lower() in source_lower)
            source_grounding = min(10.0, (grounded / max(len(vocab_words), 1)) * 10)

        overall = max(0, min(10, (score + source_grounding) / 2))
        passed = overall >= 6.0 and not any("placeholder" in i.lower() or "duplicate" in i.lower() for i in issues)

        report: QualityReport = {
            "period_number": period_num,
            "passed": passed,
            "overall_score": round(overall, 1),
            "source_grounding_score": round(source_grounding, 1),
            "uniqueness_score": round(score, 1),
            "completeness_score": round(score, 1),
            "issues": issues,
            "recommendations": [],
        }
        quality_reports.append(report)

        if not passed and period.get("generation_attempt", 1) < state.get("max_retries", 2):
            retry_periods.append(period_num)
            logger.warning(f"  ⚠️ Period {period_num} FAILED (score: {overall:.1f}): {issues}")
        else:
            logger.info(f"  ✅ Period {period_num} PASSED (score: {overall:.1f})")

    logger.info(f"✅ Quality check done: {len(retry_periods)} need retry")

    return {
        "quality_reports": quality_reports,
        "retry_periods": retry_periods,
        "pipeline_stage": "quality_validated",
    }


# =============================================================================
# NODE 6: PACKAGE ASSEMBLY
# =============================================================================
async def assemble_package_node(state: PipelineState, config: RunnableConfig) -> dict:
    """Assembles all generated period content into the final session package."""
    logger.info("📋 [Node 6/6] Assembling final session package...")

    generated = state.get("generated_periods", [])
    analysis = state.get("source_analysis", {})
    language = state["language"]
    level = state["level"]
    topic = state["topic"]
    total_periods = state.get("total_periods", 80)

    sorted_periods = sorted(generated, key=lambda p: p.get("period_number", 0))

    # Build day_wise_syllabus
    day_wise = []
    for period in sorted_periods:
        day_wise.append({
            "day_number": period["period_number"],
            "module_week": f"Week {math.ceil(period['period_number'] / state.get('periods_per_week', 2))}",
            "day_topic": period.get("day_topic", ""),
            "grammar_rules_detail": period.get("grammar_rules_detail", ""),
            "study_notes_markdown": period.get("study_notes_markdown", ""),
            "vocabulary_bank": period.get("vocabulary_bank", []),
            "classroom_dialogues": period.get("classroom_dialogues", []),
            "pedagogical_instructions": period.get("pedagogical_instructions", ""),
            "video_breakdown_analysis": period.get("video_breakdown_analysis", ""),
            "in_class_exercises": period.get("in_class_exercises", []),
            "exercise_solutions": period.get("exercise_solutions", []),
            "homework_tasks": period.get("homework_tasks", []),
        })

    all_vocab = []
    all_grammar = []
    for period in sorted_periods:
        for v in period.get("vocabulary_bank", [])[:3]:
            word = v.get("word", v) if isinstance(v, dict) else str(v)
            if word not in all_vocab:
                all_vocab.append(word)
        t = period.get("day_topic", "")
        if t and t not in all_grammar:
            all_grammar.append(t)

    session_plan = {
        "session_title": f"{topic} — Comprehensive {language} {level} Curriculum",
        "target_language": language,
        "target_level": level,
        "track_mode": state.get("track_mode", "STANDARD"),
        "total_curriculum_days": total_periods,
        "curriculum_overview_summary": (
            f"AI-generated curriculum with {len(sorted_periods)} uniquely generated periods. "
            f"Source evidence density: {analysis.get('evidence_density', 'N/A')}. "
            f"Generated via LangGraph intelligent pipeline."
        ),
        "learning_objectives": [
            f"Master core {language} competencies for {topic}",
            f"Achieve CEFR {level} communicative fluency",
            f"Develop integrated LSRW skills through source-grounded practice",
        ],
        "grammar_focus": all_grammar[:10],
        "key_vocabulary": all_vocab[:20],
        "day_wise_syllabus": day_wise,
        "homework_and_practice": ["Complete period-specific exercises", "Record pronunciation practice"],
    }

    # Build teacher_materials
    slides = []
    for i, period in enumerate(sorted_periods[:10]):
        slides.append({
            "slide_number": i + 1,
            "slide_title": period.get("day_topic", f"Period {period['period_number']}"),
            "bullet_points": [
                v.get("word", str(v)) if isinstance(v, dict) else str(v)
                for v in period.get("vocabulary_bank", [])[:4]
            ],
            "teacher_cue": period.get("pedagogical_instructions", "Active student production."),
        })

    teacher_materials = {
        "presentation_title": f"{topic} — {language} {level}",
        "subtitle": f"{language} {level} Teaching Materials",
        "slides": slides,
        "handout_summary_markdown": sorted_periods[0].get("study_notes_markdown", "") if sorted_periods else "",
    }

    # Build student_lsrw
    fp = sorted_periods[0] if sorted_periods else {}
    dialogues = fp.get("classroom_dialogues", [])
    exercises = fp.get("exercise_solutions", [])

    student_lsrw = {
        "listening": {
            "audio_transcript_passage": dialogues[0] if dialogues else f"Listening passage for {topic}",
            "audio_script_dialogue": "\n".join(dialogues[:4]) if dialogues else f"Dialogue for {topic}",
            "comprehension_questions": [
                {"question_number": i+1, "question": ex.get("question", f"Q{i+1}"),
                 "options": ["A", "B", "C", "D"], "correct_answer": ex.get("answer", "A"),
                 "explanation": ex.get("explanation", "Based on source.")}
                for i, ex in enumerate(exercises[:3])
            ] or [{"question_number": 1, "question": "Main topic?", "options": [topic, "Other", "None", "All"],
                   "correct_answer": topic, "explanation": "Primary topic."}],
        },
        "reading": {
            "passage_title": f"{topic} — Reading",
            "reading_text": fp.get("study_notes_markdown", "")[:600],
            "vocabulary_glossary": {v.get("word", ""): v.get("meaning", "") for v in fp.get("vocabulary_bank", [])[:5] if isinstance(v, dict)} or {"term": "meaning"},
            "comprehension_questions": [{"question_number": 1, "question": "Key concepts?",
                                         "options": all_grammar[:4] or ["A", "B", "C", "D"],
                                         "correct_answer": all_grammar[0] if all_grammar else "A",
                                         "explanation": "Based on curriculum."}],
        },
        "speaking": {
            "situation_prompt": f"Practice conversational {language} on {topic}",
            "roleplay_scenario": f"Discussing {topic} with a native speaker",
            "pronunciation_hints": ["Focus on accurate pronunciation of target vocabulary"],
            "guiding_questions": [f"How would you discuss {topic} in {language}?"],
            "sample_dialogue_answer": dialogues[0] if dialogues else f"Sample dialogue for {topic}",
        },
        "writing": {
            "task_prompt": f"Write about {topic} in {language} using today's vocabulary",
            "word_count_guideline": "50-100 words",
            "guiding_hints": ["Use vocabulary from the lesson"],
            "sample_model_response": f"Model response in {language} at {level}",
            "evaluation_rubrics": [
                {"criteria_name": "Grammar Accuracy", "weight_percentage": 40, "grading_prompt_instructions": "Check syntax."},
                {"criteria_name": "Vocabulary Usage", "weight_percentage": 30, "grading_prompt_instructions": "Verify source vocab."},
                {"criteria_name": "Task Completion", "weight_percentage": 30, "grading_prompt_instructions": "Assess goal."},
            ],
        },
    }

    logger.info(f"✅ Package assembled: {len(day_wise)} periods")

    return {
        "session_plan": session_plan,
        "teacher_materials": teacher_materials,
        "student_lsrw": student_lsrw,
        "pipeline_stage": "package_assembled",
    }


# =============================================================================
# CONDITIONAL EDGE FUNCTION
# =============================================================================
def should_retry(state: PipelineState) -> str:
    """Determines if the pipeline should retry failed periods or proceed to assembly."""
    retry_periods = state.get("retry_periods", [])
    if not retry_periods:
        return "assemble"

    generated = state.get("generated_periods", [])
    max_retries = state.get("max_retries", 2)

    for period_num in retry_periods:
        matching = [p for p in generated if p.get("period_number") == period_num]
        if matching and matching[0].get("generation_attempt", 1) < max_retries:
            logger.info(f"🔄 Retrying {len(retry_periods)} periods")
            return "retry"

    return "assemble"
