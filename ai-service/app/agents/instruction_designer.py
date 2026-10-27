"""
Stage C: Dynamic Instruction Designer.

Generates a task-specific instruction plan from source analysis results.
This plan drives what Gemini generates — no fixed lesson templates.
"""
import json
import logging
from typing import Optional

import httpx

from app.config.settings import settings
from app.models.source_evidence import (
    SourceAnalysis,
    InstructionPlan,
    PlannedSection,
    PlannedExercise,
)

logger = logging.getLogger(__name__)


class InstructionDesignerAgent:
    """Creates dynamic, source-specific instruction plans."""

    async def _call_gemini_json(self, prompt: str, max_tokens: int = 4096) -> Optional[dict]:
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY.startswith("AQ.placeholder"):
            return None
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{settings.LLM_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.15,
                "maxOutputTokens": max_tokens,
                "response_mime_type": "application/json",
            },
        }
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        raw = candidates[0]["content"]["parts"][0]["text"]
                        return self._parse_json_safe(raw)
        except Exception as e:
            logger.warning(f"Instruction design Gemini call failed: {e}")
        return None

    @staticmethod
    def _parse_json_safe(raw: str) -> Optional[dict]:
        clean = raw.strip()
        for prefix in ("```json", "```"):
            if clean.startswith(prefix):
                clean = clean[len(prefix):]
        if clean.endswith("```"):
            clean = clean[:-3]
        try:
            return json.loads(clean.strip(), strict=False)
        except json.JSONDecodeError:
            import re
            match = re.search(r'(\{[\s\S]*\})', clean)
            if match:
                try:
                    return json.loads(match.group(1), strict=False)
                except json.JSONDecodeError:
                    pass
        return None

    def _serialize_analysis_for_prompt(self, analysis: SourceAnalysis) -> str:
        """Compact serialization of analysis findings for the design prompt."""
        parts = []
        if analysis.main_topics:
            parts.append(f"Main Topics: {', '.join(analysis.main_topics)}")
        if analysis.subtopics:
            parts.append(f"Subtopics: {', '.join(analysis.subtopics)}")
        if analysis.vocabulary_items:
            vocab_list = [f"  - {v.item} (confidence: {v.confidence})" for v in analysis.vocabulary_items[:30]]
            parts.append("Vocabulary Found:\n" + "\n".join(vocab_list))
        if analysis.grammar_structures:
            gram_list = [f"  - {g.item}" for g in analysis.grammar_structures[:15]]
            parts.append("Grammar Structures:\n" + "\n".join(gram_list))
        if analysis.expressions_idioms:
            expr_list = [f"  - {e.item}" for e in analysis.expressions_idioms[:15]]
            parts.append("Expressions/Idioms:\n" + "\n".join(expr_list))
        if analysis.example_sentences:
            ex_list = [f"  - {e.item}" for e in analysis.example_sentences[:10]]
            parts.append("Example Sentences from Source:\n" + "\n".join(ex_list))
        if analysis.communicative_situations:
            parts.append(f"Communicative Situations: {', '.join(analysis.communicative_situations)}")
        if analysis.prerequisite_knowledge:
            parts.append(f"Prerequisites: {', '.join(analysis.prerequisite_knowledge)}")
        if analysis.gaps:
            parts.append(f"Source Gaps: {', '.join(analysis.gaps)}")
        if analysis.source_coverage_summary:
            parts.append(f"Coverage Summary: {analysis.source_coverage_summary}")
        parts.append(f"Evidence Density: {analysis.evidence_density}")
        return "\n\n".join(parts)

    def _build_design_prompt(
        self,
        analysis: SourceAnalysis,
        language: str,
        level: str,
        topic: str,
        day_number: int,
        total_days: int,
        track_mode: str,
    ) -> str:
        analysis_text = self._serialize_analysis_for_prompt(analysis)

        return f"""You are an instructional design specialist. Based on the source evidence analysis below, create an instruction plan that determines what a lesson should contain.

CONTEXT:
- Language: {language}, Level: {level}
- Course Topic: {topic}
- Day {day_number} of {total_days} ({track_mode} track)

SOURCE EVIDENCE ANALYSIS:
{analysis_text}

TASK:
Design an instruction plan that:
1. Determines what the lesson should teach based on the source evidence above.
2. Selects which output sections are relevant (do NOT force every possible section).
3. Identifies which source examples are worth preserving verbatim.
4. Identifies what additional explanation is needed to make the source understandable.
5. Plans exercise types that test the actual discovered concepts.
6. Lists concepts that cannot be safely taught because the source doesn't cover them.

Return JSON:
{{
  "lesson_title": "Descriptive title reflecting actual source content",
  "lesson_focus": "Primary instructional focus derived from evidence",
  "concepts_to_explain": ["concept 1 from source", "concept 2 from source"],
  "source_examples_to_preserve": ["verbatim example worth keeping"],
  "additional_explanation_needed": ["gap that needs pedagogical bridging"],
  "prerequisite_bridges": ["prerequisite to briefly review"],
  "planned_sections": [
    {{
      "section_type": "vocabulary_table or grammar_explanation or dialogue or pronunciation or exercises or reading_passage or conjugation_matrix or cultural_notes",
      "rationale": "Why this section is relevant given the source",
      "key_content_points": ["what to cover"],
      "source_evidence_refs": ["which evidence item supports this"]
    }}
  ],
  "planned_exercises": [
    {{
      "exercise_type": "conjugation_drill or translation or error_correction or fill_blank or comprehension or matching or sentence_construction",
      "target_concept": "which source concept this tests",
      "difficulty": "appropriate for {level}"
    }}
  ],
  "sections_excluded": ["sections omitted because source doesn't support them"],
  "unfillable_gaps": ["gaps that cannot be safely filled from evidence"]
}}

RULES:
1. Only plan sections that the source evidence supports.
2. If the source has vocabulary but no grammar rules, do NOT plan a grammar section.
3. If the source has no dialogues, do NOT plan a dialogue section unless it would genuinely help teach the discovered vocabulary.
4. Exercise types must match the discovered content — do not plan conjugation drills if no verbs were found.
5. Be honest about unfillable gaps.
6. Return valid JSON only."""

    def _build_fallback_plan(
        self,
        analysis: SourceAnalysis,
        language: str,
        level: str,
        topic: str,
    ) -> InstructionPlan:
        """Deterministic fallback when Gemini is unavailable.
        Derives plan directly from analysis structure — still source-dependent."""

        sections = []
        exercises = []

        if analysis.vocabulary_items:
            sections.append(PlannedSection(
                section_type="vocabulary_table",
                rationale="Source contains vocabulary items that should be taught.",
                key_content_points=[v.item for v in analysis.vocabulary_items[:10]],
                source_evidence_refs=[v.evidence_excerpt or v.item for v in analysis.vocabulary_items[:5]],
            ))
            exercises.append(PlannedExercise(
                exercise_type="translation",
                target_concept="vocabulary from source",
                difficulty=f"appropriate for {level}",
            ))

        if analysis.grammar_structures:
            sections.append(PlannedSection(
                section_type="grammar_explanation",
                rationale="Source contains grammar structures requiring explanation.",
                key_content_points=[g.item for g in analysis.grammar_structures[:8]],
                source_evidence_refs=[g.evidence_excerpt or g.item for g in analysis.grammar_structures[:5]],
            ))
            exercises.append(PlannedExercise(
                exercise_type="error_correction",
                target_concept="grammar rules from source",
                difficulty=f"appropriate for {level}",
            ))

        if analysis.expressions_idioms:
            sections.append(PlannedSection(
                section_type="dialogue",
                rationale="Source contains expressions best practiced through dialogue.",
                key_content_points=[e.item for e in analysis.expressions_idioms[:8]],
                source_evidence_refs=[],
            ))

        if analysis.example_sentences:
            sections.append(PlannedSection(
                section_type="reading_passage",
                rationale="Source contains example sentences that form a learning passage.",
                key_content_points=[e.item for e in analysis.example_sentences[:5]],
                source_evidence_refs=[],
            ))

        return InstructionPlan(
            lesson_title=f"{topic} — Source-Grounded Lesson ({language} {level})",
            lesson_focus=analysis.source_coverage_summary or f"Content from uploaded source materials on {topic}",
            concepts_to_explain=[t for t in analysis.main_topics],
            source_examples_to_preserve=[e.item for e in analysis.example_sentences[:5]],
            additional_explanation_needed=analysis.gaps[:3],
            prerequisite_bridges=analysis.prerequisite_knowledge[:3],
            planned_sections=sections,
            planned_exercises=exercises,
            sections_excluded=[],
            unfillable_gaps=analysis.gaps,
        )

    async def design(
        self,
        analysis: SourceAnalysis,
        language: str,
        level: str,
        topic: str,
        day_number: int = 1,
        total_days: int = 1,
        track_mode: str = "STANDARD",
    ) -> InstructionPlan:
        """Generate a dynamic instruction plan from source analysis."""

        if not analysis.has_sufficient_evidence():
            logger.info("Insufficient source evidence for instruction design.")
            return InstructionPlan(
                lesson_title=f"{topic} ({language} {level})",
                lesson_focus="Insufficient source evidence to design a source-grounded lesson.",
                unfillable_gaps=["Source material does not contain enough instructional content for a full lesson plan."],
                sections_excluded=["All sections excluded due to insufficient evidence"],
            )

        prompt = self._build_design_prompt(
            analysis=analysis,
            language=language,
            level=level,
            topic=topic,
            day_number=day_number,
            total_days=total_days,
            track_mode=track_mode,
        )

        result = await self._call_gemini_json(prompt, max_tokens=3072)

        if not result:
            logger.warning("Instruction design Gemini call returned no result, using deterministic fallback.")
            return self._build_fallback_plan(analysis, language, level, topic)

        try:
            plan = InstructionPlan(
                lesson_title=result.get("lesson_title", topic),
                lesson_focus=result.get("lesson_focus", ""),
                concepts_to_explain=result.get("concepts_to_explain", []),
                source_examples_to_preserve=result.get("source_examples_to_preserve", []),
                additional_explanation_needed=result.get("additional_explanation_needed", []),
                prerequisite_bridges=result.get("prerequisite_bridges", []),
                planned_sections=[
                    PlannedSection(**s) for s in result.get("planned_sections", [])
                    if isinstance(s, dict) and s.get("section_type")
                ],
                planned_exercises=[
                    PlannedExercise(**e) for e in result.get("planned_exercises", [])
                    if isinstance(e, dict) and e.get("exercise_type")
                ],
                sections_excluded=result.get("sections_excluded", []),
                unfillable_gaps=result.get("unfillable_gaps", []),
            )
            logger.info(
                f"Instruction plan created: {len(plan.planned_sections)} sections, "
                f"{len(plan.planned_exercises)} exercises"
            )
            return plan
        except Exception as e:
            logger.warning(f"Failed to parse instruction plan: {e}")
            return self._build_fallback_plan(analysis, language, level, topic)
