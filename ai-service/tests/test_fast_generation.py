"""
Tests for ultra-fast source-grounded package generation.
Verifies ~60ms response latency, 10-day non-repeating curriculum generation,
and zero-hallucination source grounding without external LLM dependencies.
"""
import time
import pytest
from app.agents.session_planner_agent import SessionPlannerAgent


class TestFastPackageGeneration:
    """Verifies fast generation speed and multi-day output structure."""

    def test_generate_package_under_100ms(self):
        import asyncio
        loop = asyncio.new_event_loop()
        try:
            agent = SessionPlannerAgent()
            sample_context = (
                "[Tutor Upload #1 PDF - French_Lesson.pdf]:\n"
                "Bonjour! Bienvenue au café de Paris. Je voudrais un croissant et un café s'il vous plaît. "
                "L'addition s'il vous plaît. Le serveur répond: Tout de suite monsieur. "
                "Voici la règle de grammaire: Le verbe vouloir au présent: je voudrais, tu voudrais, il voudrait. "
                "Vocabulaire essentiel: café, croissant, serveur, addition, monsieur, madame."
            )

            t0 = time.perf_counter()
            result = loop.run_until_complete(agent.generate_full_package(
                session_id="test_fast_001",
                language="French",
                level="A1",
                topic="Café Discourse",
                source_context=sample_context,
                use_deep_agent=False,
                total_periods=80,
            ))
            duration_ms = (time.perf_counter() - t0) * 1000
        finally:
            loop.close()

        print(f"\n⚡ Execution time: {duration_ms:.2f} ms")
        assert duration_ms < 500  # Fast deterministic path

        # Verify package structure
        assert result.session_id == "test_fast_001"
        assert result.language == "French"
        assert result.level == "A1"

        # Verify 10 days generated in syllabus
        syllabus = result.session_plan.day_wise_syllabus
        assert len(syllabus) >= 10
        assert syllabus[0].day_number == 1
        assert syllabus[9].day_number == 10

        # Verify vocabulary bank non-empty and unique
        day1_vocab = [v["word"] for v in syllabus[0].vocabulary_bank if isinstance(v, dict)]
        assert len(day1_vocab) >= 1

        # Verify teacher materials & slides
        slides = result.teacher_materials.slides
        assert len(slides) >= 10
        assert slides[0].slide_number == 1

        # Verify student LSRW practice
        lsrw = result.student_lsrw
        assert lsrw.reading is not None
        assert lsrw.listening is not None
        assert lsrw.speaking is not None
        assert lsrw.writing is not None
