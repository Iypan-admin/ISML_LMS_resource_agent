"""
Tests for the Source-Driven Dynamic Prompt Generation Pipeline.

Covers:
1. Different source inputs producing different analyses
2. Evidence analysis with real vs empty sources
3. Instruction plan varies with source evidence
4. Empty extraction prevents lesson generation
5. Validation catches unsupported claims
6. Evidence references map to extracted segments
7. Valid JSON and schema enforcement
8. No generic lesson fallback on failure
9. Dynamic prompt builder output varies with evidence
10. ExtractionBundle helper methods
"""
import pytest
import json
from unittest.mock import AsyncMock, patch, MagicMock

from app.models.source_evidence import (
    ExtractionBundle,
    ExtractedSource,
    ExtractionStatus,
    SourceAnalysis,
    EvidenceItem,
    InstructionPlan,
    PlannedSection,
    PlannedExercise,
    ValidationReport,
    ValidationIssue,
    QualityReport,
)
from app.agents.evidence_validator import EvidenceValidator, QualityEvaluator
from app.prompts.academic_prompts import build_synthesis_prompt, SYSTEM_POLICY


# =============================================================================
# Test 1: ExtractionBundle — usable evidence detection
# =============================================================================

class TestExtractionBundle:
    def test_empty_bundle_has_no_evidence(self):
        bundle = ExtractionBundle(
            total_sources=0,
            successful_sources=0,
            combined_text="",
            combined_text_length=0,
        )
        assert not bundle.has_usable_evidence()

    def test_short_text_has_no_evidence(self):
        bundle = ExtractionBundle(
            total_sources=1,
            successful_sources=1,
            combined_text="too short",
            combined_text_length=9,
        )
        assert not bundle.has_usable_evidence()

    def test_real_text_has_evidence(self):
        bundle = ExtractionBundle(
            sources=[ExtractedSource(
                source_id="src_1",
                source_name="test.pdf",
                source_type="PDF",
                extracted_text="This is a substantial educational text about French verb conjugation patterns and grammar rules.",
                text_length=93,
            )],
            total_sources=1,
            successful_sources=1,
            combined_text="This is a substantial educational text about French verb conjugation patterns and grammar rules.",
            combined_text_length=93,
        )
        assert bundle.has_usable_evidence()


# =============================================================================
# Test 2: SourceAnalysis — sufficient evidence detection
# =============================================================================

class TestSourceAnalysis:
    def test_empty_analysis_insufficient(self):
        analysis = SourceAnalysis()
        assert not analysis.has_sufficient_evidence()

    def test_topics_only_insufficient(self):
        analysis = SourceAnalysis(main_topics=["French greetings"])
        assert not analysis.has_sufficient_evidence()

    def test_topics_plus_vocab_sufficient(self):
        analysis = SourceAnalysis(
            main_topics=["French greetings"],
            vocabulary_items=[
                EvidenceItem(item="bonjour", category="vocabulary", evidence_excerpt="Bonjour is used..."),
            ],
        )
        assert analysis.has_sufficient_evidence()

    def test_topics_plus_grammar_sufficient(self):
        analysis = SourceAnalysis(
            main_topics=["Verb conjugation"],
            grammar_structures=[
                EvidenceItem(item="-er verb endings", category="grammar", evidence_excerpt="Regular -er verbs..."),
            ],
        )
        assert analysis.has_sufficient_evidence()


# =============================================================================
# Test 3: Evidence Validator — deterministic checks
# =============================================================================

class TestEvidenceValidator:
    def setup_method(self):
        self.validator = EvidenceValidator()
        self.analysis = SourceAnalysis(
            main_topics=["French greetings"],
            vocabulary_items=[
                EvidenceItem(item="bonjour", category="vocabulary"),
                EvidenceItem(item="merci", category="vocabulary"),
            ],
        )
        self.plan = InstructionPlan(lesson_title="French Greetings")

    def test_valid_package_passes(self):
        data = {
            "session_plan": {
                "day_wise_syllabus": [{
                    "day_number": 1,
                    "day_topic": "Day 1: Greetings",
                    "study_notes_markdown": "### Study Guide\n\nReal content here.",
                    "vocabulary_bank": [
                        {"word": "bonjour", "meaning": "hello"},
                        {"word": "merci", "meaning": "thank you"},
                    ],
                    "exercise_solutions": [
                        {"question": "Q1", "answer": "bonjour", "explanation": "Standard greeting"},
                    ],
                }],
            },
            "teacher_materials": {},
            "student_lsrw": {},
        }
        report = self.validator.validate(data, self.analysis, self.plan, "French", "A1")
        assert report.is_valid
        assert report.passed_checks > 0

    def test_missing_top_level_keys_fails(self):
        data = {"session_plan": {"day_wise_syllabus": []}}
        report = self.validator.validate(data, self.analysis, self.plan, "French", "A1")
        assert not report.is_valid
        assert any(i.issue_type == "schema_error" for i in report.issues)

    def test_placeholder_content_flagged(self):
        data = {
            "session_plan": {
                "day_wise_syllabus": [{
                    "day_number": 1,
                    "day_topic": "Day 1",
                    "study_notes_markdown": "### Guide\n\ncontinue similarly for other topics.",
                    "vocabulary_bank": [],
                    "exercise_solutions": [],
                }],
            },
            "teacher_materials": {},
            "student_lsrw": {},
        }
        report = self.validator.validate(data, self.analysis, self.plan, "French", "A1")
        placeholder_issues = [i for i in report.issues if "placeholder" in i.description.lower()]
        assert len(placeholder_issues) > 0

    def test_unsupported_vocab_flagged(self):
        """Generated vocab that doesn't match source evidence should be flagged."""
        data = {
            "session_plan": {
                "day_wise_syllabus": [{
                    "day_number": 1,
                    "day_topic": "Day 1",
                    "study_notes_markdown": "### Guide\n\nReal content.",
                    "vocabulary_bank": [
                        {"word": "unrelated_word_xyz", "meaning": "not in source"},
                    ],
                    "exercise_solutions": [],
                }],
            },
            "teacher_materials": {},
            "student_lsrw": {},
        }
        report = self.validator.validate(data, self.analysis, self.plan, "French", "A1")
        unsupported = [i for i in report.issues if i.issue_type == "unsupported_claim"]
        assert len(unsupported) > 0

    def test_missing_exercise_answers_flagged(self):
        data = {
            "session_plan": {
                "day_wise_syllabus": [{
                    "day_number": 1,
                    "day_topic": "Day 1",
                    "study_notes_markdown": "### Notes",
                    "vocabulary_bank": [],
                    "exercise_solutions": [
                        {"question": "Q1", "answer": "", "explanation": "No answer"},
                    ],
                }],
            },
            "teacher_materials": {},
            "student_lsrw": {},
        }
        report = self.validator.validate(data, self.analysis, self.plan, "French", "A1")
        answer_issues = [i for i in report.issues if i.issue_type == "incorrect_answer"]
        assert len(answer_issues) > 0


# =============================================================================
# Test 4: Quality Evaluator
# =============================================================================

class TestQualityEvaluator:
    def setup_method(self):
        self.evaluator = QualityEvaluator()

    def test_acceptable_quality(self):
        analysis = SourceAnalysis(main_topics=["Greetings"])
        plan = InstructionPlan(lesson_title="Greetings")
        validation = ValidationReport(is_valid=True, total_checks=5, passed_checks=5)
        data = {
            "session_plan": {
                "session_title": "Greetings Lesson",
                "day_wise_syllabus": [{"study_notes_markdown": "content", "exercise_solutions": []}],
            },
        }
        quality = self.evaluator.evaluate(data, analysis, plan, validation)
        assert quality.overall_acceptable

    def test_failed_validation_rejects(self):
        analysis = SourceAnalysis()
        plan = InstructionPlan(lesson_title="Test")
        validation = ValidationReport(is_valid=False, total_checks=5, passed_checks=1)
        data = {"session_plan": {"session_title": "Test", "day_wise_syllabus": []}}
        quality = self.evaluator.evaluate(data, analysis, plan, validation)
        assert not quality.overall_acceptable
        assert quality.recommendation in ("reject", "revise")


# =============================================================================
# Test 5: Dynamic Prompt Builder — output varies with evidence
# =============================================================================

class TestDynamicPromptBuilder:
    def test_prompt_includes_source_vocabulary(self):
        analysis = SourceAnalysis(
            vocabulary_items=[
                EvidenceItem(item="bonjour", category="vocabulary", evidence_excerpt="Bonjour is a greeting"),
                EvidenceItem(item="merci", category="vocabulary", evidence_excerpt="Merci means thank you"),
            ],
            source_coverage_summary="Source covers French greetings",
            evidence_density="high",
        )
        plan = InstructionPlan(
            lesson_title="French Greetings from Source",
            lesson_focus="Teaching greetings found in uploaded video",
            concepts_to_explain=["Basic French greetings"],
            planned_sections=[PlannedSection(
                section_type="vocabulary_table",
                rationale="Source contains greeting vocabulary",
            )],
        )
        prompt = build_synthesis_prompt(
            source_text="Bonjour! Merci beaucoup!",
            analysis=analysis,
            plan=plan,
            language="French",
            level="A1",
            topic="Greetings",
            track_mode="STANDARD",
            total_days=365,
        )

        assert "bonjour" in prompt.lower()
        assert "merci" in prompt.lower()
        assert "vocabulary_table" in prompt
        assert "French Greetings from Source" in prompt

    def test_prompt_differs_for_different_evidence(self):
        """Two different source analyses should produce materially different prompts."""
        analysis_greetings = SourceAnalysis(
            vocabulary_items=[EvidenceItem(item="bonjour", category="vocabulary")],
            main_topics=["Greetings"],
            source_coverage_summary="Greetings lesson",
            evidence_density="medium",
        )
        analysis_food = SourceAnalysis(
            vocabulary_items=[EvidenceItem(item="le fromage", category="vocabulary")],
            main_topics=["Food vocabulary"],
            source_coverage_summary="Restaurant and food vocabulary",
            evidence_density="medium",
        )

        plan_greetings = InstructionPlan(lesson_title="Greetings", lesson_focus="Greetings")
        plan_food = InstructionPlan(lesson_title="Food", lesson_focus="Food")

        prompt1 = build_synthesis_prompt("", analysis_greetings, plan_greetings, "French", "A1", "Greetings", "STANDARD", 365)
        prompt2 = build_synthesis_prompt("", analysis_food, plan_food, "French", "A1", "Food", "STANDARD", 365)

        assert "bonjour" in prompt1.lower()
        assert "fromage" in prompt2.lower()
        assert "bonjour" not in prompt2.lower()
        assert "fromage" not in prompt1.lower()

    def test_prompt_includes_system_policy(self):
        analysis = SourceAnalysis(evidence_density="none")
        plan = InstructionPlan(lesson_title="Test")
        prompt = build_synthesis_prompt("", analysis, plan, "French", "A1", "Test", "STANDARD", 30)
        assert "EVIDENCE RULES" in prompt
        assert "valid json" in prompt.lower()

    def test_prompt_marks_unfillable_gaps(self):
        analysis = SourceAnalysis(evidence_density="low")
        plan = InstructionPlan(
            lesson_title="Test",
            unfillable_gaps=["No pronunciation data in source", "No cultural context available"],
        )
        prompt = build_synthesis_prompt("", analysis, plan, "French", "A1", "Test", "STANDARD", 30)
        assert "No pronunciation data in source" in prompt
        assert "UNFILLABLE GAPS" in prompt


# =============================================================================
# Test 6: No generic fallback on failure
# =============================================================================

class TestNoGenericFallback:
    """Verify that the session planner does not produce generic hardcoded content."""

    def test_analysis_based_package_uses_evidence(self):
        """When Gemini is offline but analysis succeeded, package reflects actual analysis."""
        from app.agents.session_planner_agent import SessionPlannerAgent
        agent = SessionPlannerAgent()

        analysis = SourceAnalysis(
            main_topics=["Restaurant French"],
            vocabulary_items=[
                EvidenceItem(item="le menu", category="vocabulary", evidence_excerpt="the menu at restaurant"),
                EvidenceItem(item="commander", category="vocabulary", evidence_excerpt="to order food"),
            ],
            grammar_structures=[
                EvidenceItem(item="partitive articles", category="grammar", evidence_excerpt="du, de la, des"),
            ],
            source_coverage_summary="Restaurant vocabulary and ordering expressions",
            evidence_density="medium",
        )
        plan = InstructionPlan(
            lesson_title="Restaurant French — Ordering",
            lesson_focus="Restaurant vocabulary from uploaded source",
            concepts_to_explain=["Partitive articles"],
            planned_sections=[PlannedSection(section_type="vocabulary_table", rationale="Source has vocab")],
            planned_exercises=[PlannedExercise(exercise_type="translation", target_concept="ordering vocabulary")],
        )

        package = agent._build_analysis_based_package(
            analysis=analysis,
            plan=plan,
            language="French",
            level="A1",
            topic="Restaurant French",
            track_mode="STANDARD",
            total_days=365,
        )

        # Verify the package uses actual analysis data, not hardcoded content
        day = package["session_plan"]["day_wise_syllabus"][0]
        vocab_words = [v["word"] for v in day["vocabulary_bank"]]
        assert "le menu" in vocab_words
        assert "commander" in vocab_words
        # Should NOT contain hardcoded French fallback content
        assert "parler" not in vocab_words
        assert "habiter" not in vocab_words

        # Study notes should mention source evidence
        assert "Restaurant" in day["study_notes_markdown"] or "menu" in day["study_notes_markdown"].lower()


# =============================================================================
# Test 7: Prompt does not contain hardcoded lesson content
# =============================================================================

class TestNoHardcodedContent:
    def test_system_policy_has_no_vocabulary(self):
        """SYSTEM_POLICY should not contain language-specific vocabulary or examples."""
        assert "parler" not in SYSTEM_POLICY
        assert "habiter" not in SYSTEM_POLICY
        assert "bonjour" not in SYSTEM_POLICY.lower()
        assert "sprechen" not in SYSTEM_POLICY
        assert "hablar" not in SYSTEM_POLICY

    def test_system_policy_has_no_conjugation_tables(self):
        assert "parlons" not in SYSTEM_POLICY
        assert "hablamos" not in SYSTEM_POLICY
        assert "wohnen" not in SYSTEM_POLICY
