"""
Unit tests for the LangGraph Intelligent Content Generation Pipeline.
Tests pipeline compilation, node structure, fallback mechanics, and helper functions.
"""
import pytest
import json
from app.graph.state import PipelineState, PeriodContent, SourceChunk, QualityReport
from app.graph.pipeline import build_content_pipeline, get_compiled_pipeline
from app.graph.nodes import (
    _safe_json_parse,
    _build_fallback_period,
    should_retry,
)
from app.api.sessions import pipeline_info


class TestLangGraphPipelineStructure:
    """Verifies graph nodes, edges, and compilation integrity."""

    def test_pipeline_compiles(self):
        pipeline = get_compiled_pipeline()
        assert pipeline is not None
        node_names = set(pipeline.nodes.keys())
        expected_nodes = {
            "__start__",
            "enhance_prompt",
            "analyze_sources",
            "partition_sources",
            "generate_periods",
            "validate_quality",
            "assemble_package",
        }
        assert expected_nodes.issubset(node_names)

    def test_build_content_pipeline_nodes(self):
        graph = build_content_pipeline()
        assert "enhance_prompt" in graph.nodes
        assert "analyze_sources" in graph.nodes
        assert "partition_sources" in graph.nodes
        assert "generate_periods" in graph.nodes
        assert "validate_quality" in graph.nodes
        assert "assemble_package" in graph.nodes


class TestPipelineHelpers:
    """Tests JSON parsing, fallback creation, and retry conditional logic."""

    def test_safe_json_parse_clean(self):
        data = {"topic": "French A1", "items": [1, 2, 3]}
        raw = json.dumps(data)
        parsed = _safe_json_parse(raw)
        assert parsed == data

    def test_safe_json_parse_with_fences(self):
        data = {"unit": "Spanish B1", "status": "active"}
        raw = f"```json\n{json.dumps(data)}\n```"
        parsed = _safe_json_parse(raw)
        assert parsed == data

    def test_safe_json_parse_with_raw_fence(self):
        data = {"key": "val"}
        raw = f"```\n{json.dumps(data)}\n```"
        parsed = _safe_json_parse(raw)
        assert parsed == data

    def test_safe_json_parse_invalid(self):
        assert _safe_json_parse("this is not json at all") is None

    def test_build_fallback_period(self):
        partition = {
            "period_number": 3,
            "period_theme": "Ordering at a Café",
            "grammar_focus": "Present tense irregular verbs",
            "vocab_items": ["café", "croissant", "addition"],
        }
        state = {"topic": "Café Discourse", "language": "French"}
        period = _build_fallback_period(3, partition, state)

        assert period["period_number"] == 3
        assert "Ordering at a Café" in period["day_topic"]
        assert len(period["vocabulary_bank"]) == 3
        assert period["generation_attempt"] == 1
        assert period["quality_score"] == 0.0

    def test_should_retry_empty(self):
        state = {"retry_periods": [], "generated_periods": [], "max_retries": 2}
        assert should_retry(state) == "assemble"

    def test_should_retry_under_max(self):
        state = {
            "retry_periods": [1],
            "generated_periods": [{"period_number": 1, "generation_attempt": 1}],
            "max_retries": 2,
        }
        assert should_retry(state) == "retry"

    def test_should_retry_reached_max(self):
        state = {
            "retry_periods": [1],
            "generated_periods": [{"period_number": 1, "generation_attempt": 2}],
            "max_retries": 2,
        }
        assert should_retry(state) == "assemble"


class TestPipelineInfoEndpoint:
    """Tests the pipeline metadata endpoint."""

    def test_pipeline_info_returns_structure(self):
        coro = pipeline_info()
        try:
            coro.send(None)
            info = {}
        except StopIteration as e:
            info = e.value
        assert "pipeline" in info
        assert "nodes" in info
        assert len(info["nodes"]) == 6
        assert "features" in info
        assert len(info["features"]) == 5
        assert "llm_model" in info
        assert "has_api_key" in info


class TestPackageAssembly:
    """Tests the final stage package assembly node."""

    def test_assemble_package_produces_full_structure(self):
        from app.graph.nodes import assemble_package_node
        dummy_periods = [
            {
                "period_number": 1,
                "day_topic": "Period 1: Salutations et Présentations",
                "grammar_rules_detail": "Conjugaison du verbe être",
                "study_notes_markdown": "### Guide d'étude\nLes salutations de base.",
                "vocabulary_bank": [
                    {"word": "Bonjour", "meaning": "Hello", "pronunciation": "/bɔ̃.ʒuʁ/", "example_sentence": "Bonjour Madame."}
                ],
                "classroom_dialogues": ["A: Bonjour! (Hello!)", "B: Bonjour! Comment allez-vous? (Hello! How are you?)"],
                "pedagogical_instructions": "Focus on nasal vowels.",
                "video_breakdown_analysis": "Based on source texts.",
                "in_class_exercises": ["[S] Répétez le dialogue"],
                "exercise_solutions": [{"question": "Q1", "answer": "Bonjour", "explanation": "Salutation standard"}],
                "homework_tasks": ["Écrivez 3 phrases avec être."],
                "quality_score": 9.0,
                "generation_attempt": 1,
                "source_grounding_score": 8.5,
            }
        ]
        state = {
            "session_id": "test_sess_001",
            "language": "French",
            "level": "A1",
            "topic": "Salutations",
            "track_mode": "STANDARD",
            "institution_type": "COLLEGE",
            "total_periods": 80,
            "period_duration_minutes": 60,
            "periods_per_week": 2,
            "course_duration_hours": 80,
            "generated_periods": dummy_periods,
            "source_analysis": {"evidence_density": "high"},
        }
        coro = assemble_package_node(state, None)
        try:
            coro.send(None)
            result = {}
        except StopIteration as e:
            result = e.value

        assert "session_plan" in result
        assert "teacher_materials" in result
        assert "student_lsrw" in result
        assert result["pipeline_stage"] == "package_assembled"

        # Verify session plan day_wise_syllabus
        syllabus = result["session_plan"]["day_wise_syllabus"]
        assert len(syllabus) == 1
        assert syllabus[0]["day_topic"] == "Period 1: Salutations et Présentations"

        # Verify slides
        slides = result["teacher_materials"]["slides"]
        assert len(slides) == 1
        assert slides[0]["slide_title"] == "Period 1: Salutations et Présentations"
