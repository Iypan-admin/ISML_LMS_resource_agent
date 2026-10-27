"""
Session Planner Agent — Pipeline Orchestrator.

Orchestrates the dynamic source-driven pipeline:
  Stage A: Source extraction (handled by sessions.py + extractor.py)
  Stage B: Source evidence analysis (SourceAnalyzerAgent)
  Stage C: Dynamic instruction design (InstructionDesignerAgent)
  Stage D: Content synthesis with Gemini (this agent)
  Stage E: Evidence validation (EvidenceValidator)
  Stage F: Quality evaluation (QualityEvaluator)

No hardcoded lesson content. All generation driven by source evidence.
"""
import json
import logging
from typing import Optional, Dict, Any, List

import httpx

from app.config.settings import settings
from app.models.session_package import (
    SessionPlanResult,
    SessionPlanStep,
    TeacherMaterialResult,
    SlideItem,
    StudentLSRWPackage,
    ListeningModule,
    ReadingModule,
    SpeakingModule,
    WritingModule,
    QuestionItem,
    WritingEvaluationRubric,
    FullSessionPackageResult,
)
from app.models.source_evidence import (
    ExtractionBundle,
    ExtractedSource,
    SourceAnalysis,
    InstructionPlan,
    ValidationReport,
    QualityReport,
)
from app.agents.source_analyzer import SourceAnalyzerAgent
from app.agents.instruction_designer import InstructionDesignerAgent
from app.agents.evidence_validator import EvidenceValidator, QualityEvaluator
from app.prompts.academic_prompts import build_synthesis_prompt
from app.services.ppt_generator import PPTGenerator

logger = logging.getLogger(__name__)


class SessionPlannerAgent:
    """Orchestrates the full source-driven dynamic generation pipeline."""

    def __init__(self):
        self.source_analyzer = SourceAnalyzerAgent()
        self.instruction_designer = InstructionDesignerAgent()
        self.evidence_validator = EvidenceValidator()
        self.quality_evaluator = QualityEvaluator()

    async def _call_gemini(self, prompt: str, max_tokens: int = 8192) -> Optional[str]:
        """Calls Gemini API with prompt and JSON response mode."""
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY.startswith("AQ.placeholder"):
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": max_tokens,
                "response_mime_type": "application/json"
            },
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        return candidates[0]["content"]["parts"][0]["text"]
                else:
                    logger.warning(f"Gemini synthesis returned {resp.status_code}: {resp.text[:300]}")
        except Exception as e:
            logger.warning(f"Gemini API call failed in SessionPlannerAgent: {e}")
        return None

    @staticmethod
    def _parse_json(raw: str) -> Optional[Dict]:
        """Parse JSON from Gemini output, tolerating markdown fences."""
        clean = raw.strip()
        if clean.startswith("```json"):
            clean = clean[7:]
        if clean.startswith("```"):
            clean = clean[3:]
        if clean.endswith("```"):
            clean = clean[:-3]
        try:
            return json.loads(clean.strip(), strict=False)
        except Exception:
            import re
            # Fix unescaped backslashes often produced in IPA phonetic transcriptions (e.g. \ʁ, \ɛ)
            repaired = re.sub(r'\\(?![/"\\bfnrtu]|u[0-9a-fA-F]{4})', r'\\\\', clean.strip())
            try:
                return json.loads(repaired, strict=False)
            except Exception:
                match = re.search(r'(\{[\s\S]*\})', clean)
                if match:
                    try:
                        return json.loads(match.group(1), strict=False)
                    except Exception:
                        repaired_match = re.sub(r'\\(?![/"\\bfnrtu]|u[0-9a-fA-F]{4})', r'\\\\', match.group(1))
                        try:
                            return json.loads(repaired_match, strict=False)
                        except Exception:
                            pass
        return None

    def _build_extraction_bundle(self, source_context: str) -> ExtractionBundle:
        """Convert the legacy source_context string into an ExtractionBundle.
        This bridges the existing sessions.py extraction output to the new pipeline models."""
        if not source_context or len(source_context.strip()) < 30:
            return ExtractionBundle(
                total_sources=0,
                successful_sources=0,
                combined_text="",
                combined_text_length=0,
            )

        # Parse the labeled sections from the existing extraction format
        import re
        sections = re.split(r'\n\[(?:Tutor Upload|Reference) #', source_context)

        sources = []
        for i, section in enumerate(sections):
            if not section.strip():
                continue
            # Try to extract source type and name from the label
            label_match = re.match(r'(\d+)\s+(.+?)\]:\n([\s\S]*)', section)
            if label_match:
                idx = label_match.group(1)
                label = label_match.group(2).strip()
                text = label_match.group(3).strip()

                source_type = "TEXT"
                if "YouTube" in label:
                    source_type = "YOUTUBE"
                elif "PDF" in label:
                    source_type = "PDF"
                elif "Word" in label:
                    source_type = "DOCX"
                elif "Slides" in label or "Presentation" in label:
                    source_type = "PPTX"
                elif "Image" in label:
                    source_type = "IMAGE"
                elif "Audio" in label:
                    source_type = "AUDIO"
                elif "Web" in label:
                    source_type = "WEB_ARTICLE"

                sources.append(ExtractedSource(
                    source_id=f"src_{idx}",
                    source_name=label,
                    source_type=source_type,
                    extracted_text=text,
                    text_length=len(text),
                ))
            else:
                # Unlabeled content
                sources.append(ExtractedSource(
                    source_id=f"src_{i}",
                    source_name=f"Source {i}",
                    source_type="TEXT",
                    extracted_text=section.strip(),
                    text_length=len(section.strip()),
                ))

        successful = [s for s in sources if s.text_length > 10]
        combined = source_context.strip()

        return ExtractionBundle(
            sources=sources,
            total_sources=len(sources),
            successful_sources=len(successful),
            failed_sources=len(sources) - len(successful),
            combined_text=combined,
            combined_text_length=len(combined),
        )

    async def generate_full_package(
        self,
        session_id: str,
        language: str,
        level: str,
        topic: str,
        track_mode: str = "STANDARD",
        custom_days: Optional[int] = None,
        source_context: str = "",
        pptx_output_dir: str = "static/presentations",
    ) -> FullSessionPackageResult:
        """Orchestrates the full dynamic pipeline:
        Extract → Analyze → Plan → Synthesize → Validate → Evaluate."""

        # ── Track Configuration ──────────────────────────────────────────
        track_labels = {
            "STANDARD": ("Standard Course (12 Calendar Months • 365 Days)", 365),
            "INTERNSHIP": ("Internship Program (6 Calendar Months • 181 Days)", 181),
            "SUPER_INTERNSHIP": ("Super Internship Fast-Track (3 Calendar Months • 90 Days)", 90),
            "CUSTOM": ("Custom Calendar Track", 30),
        }
        track_info = track_labels.get(track_mode.upper(), track_labels["SUPER_INTERNSHIP"])
        track_label, total_days = track_info
        if custom_days and custom_days > 0:
            total_days = custom_days
            track_label = f"Custom Focus ({custom_days} Days)"

        # ── Stage A: Build Extraction Bundle ─────────────────────────────
        extraction_bundle = self._build_extraction_bundle(source_context)
        has_source = extraction_bundle.has_usable_evidence()

        logger.info(
            f"Pipeline start: session={session_id}, lang={language}, level={level}, "
            f"sources={extraction_bundle.successful_sources}, "
            f"text_len={extraction_bundle.combined_text_length}"
        )

        # ── Stage B: Source Evidence Analysis ────────────────────────────
        analysis = await self.source_analyzer.analyze(
            extraction_bundle=extraction_bundle,
            language=language,
            level=level,
            topic=topic,
        )
        logger.info(
            f"Analysis complete: topics={len(analysis.main_topics)}, "
            f"vocab={len(analysis.vocabulary_items)}, "
            f"grammar={len(analysis.grammar_structures)}, "
            f"density={analysis.evidence_density}"
        )

        # ── Stage C: Dynamic Instruction Design ─────────────────────────
        plan = await self.instruction_designer.design(
            analysis=analysis,
            language=language,
            level=level,
            topic=topic,
            day_number=1,
            total_days=total_days,
            track_mode=track_mode,
        )
        logger.info(
            f"Instruction plan: '{plan.lesson_title}', "
            f"sections={len(plan.planned_sections)}, "
            f"exercises={len(plan.planned_exercises)}"
        )

        # ── Stage D: Content Synthesis with Gemini ──────────────────────
        synthesis_prompt = build_synthesis_prompt(
            source_text=extraction_bundle.combined_text if has_source else "",
            analysis=analysis,
            plan=plan,
            language=language,
            level=level,
            topic=topic,
            track_mode=track_mode,
            total_days=total_days,
            day_count_to_generate=min(total_days, 5),
        )

        llm_output = await self._call_gemini(synthesis_prompt, max_tokens=8192)
        parsed_data = None

        if llm_output:
            parsed_data = self._parse_json(llm_output)
            if parsed_data:
                logger.info("Gemini synthesis returned valid JSON.")
            else:
                logger.warning("Gemini synthesis returned unparseable output.")

        # ── Handle synthesis failure explicitly ──────────────────────────
        if not parsed_data:
            if not has_source:
                # No source AND no LLM — explicit failure, no silent fallback
                logger.error("No source evidence and Gemini unavailable. Cannot generate.")
                raise ValueError(
                    "Unable to generate session package: no source materials were provided "
                    "and the AI model is currently unavailable. Please upload reference "
                    "materials (videos, documents, or links) and try again."
                )
            else:
                # Has source but LLM failed — create minimal package from analysis
                logger.warning("Gemini synthesis failed. Building minimal package from analysis results.")
                parsed_data = self._build_analysis_based_package(
                    analysis=analysis,
                    plan=plan,
                    language=language,
                    level=level,
                    topic=topic,
                    track_mode=track_mode,
                    total_days=total_days,
                )

        # ── Stage E: Evidence Validation ────────────────────────────────
        validation = self.evidence_validator.validate(
            generated_data=parsed_data,
            analysis=analysis,
            plan=plan,
            language=language,
            level=level,
        )
        logger.info(
            f"Validation: valid={validation.is_valid}, "
            f"passed={validation.passed_checks}/{validation.total_checks}, "
            f"issues={len(validation.issues)}"
        )

        # ── Stage F: Quality Evaluation ─────────────────────────────────
        quality = self.quality_evaluator.evaluate(
            generated_data=parsed_data,
            analysis=analysis,
            plan=plan,
            validation=validation,
        )
        logger.info(
            f"Quality: acceptable={quality.overall_acceptable}, "
            f"recommendation={quality.recommendation}"
        )

        # Log warnings but don't block — validation issues are informational
        if validation.warnings:
            for w in validation.warnings[:5]:
                logger.info(f"  Validation warning: {w}")

        # ── Generate PPTX ───────────────────────────────────────────────
        pptx_filename = f"{session_id}_{language}_{level}.pptx".replace(" ", "_")
        pptx_filepath = f"{pptx_output_dir}/{pptx_filename}"
        try:
            slides = [s if isinstance(s, dict) else s.dict() for s in parsed_data["teacher_materials"]["slides"]]
            PPTGenerator.create_presentation(
                title=parsed_data["teacher_materials"]["presentation_title"],
                subtitle=parsed_data["teacher_materials"]["subtitle"],
                slides_data=slides,
                output_path=pptx_filepath,
            )
            download_url = f"/api/v1/sessions/download/pptx/{pptx_filename}"
            parsed_data["teacher_materials"]["pptx_download_url"] = download_url
        except Exception as e:
            logger.error(f"Failed to generate PPTX file: {e}")

        # ── Assemble Final Result ───────────────────────────────────────
        return FullSessionPackageResult(
            session_id=session_id,
            topic=topic,
            language=language,
            level=level,
            track_mode=track_mode.upper(),
            track_duration_label=track_label,
            session_plan=SessionPlanResult(**parsed_data["session_plan"]),
            teacher_materials=TeacherMaterialResult(**parsed_data["teacher_materials"]),
            student_lsrw=StudentLSRWPackage(**parsed_data["student_lsrw"]),
            extracted_source_summary=(
                f"Sources: {extraction_bundle.successful_sources} analyzed "
                f"({extraction_bundle.combined_text_length} chars). "
                f"Evidence density: {analysis.evidence_density}. "
                f"Validation: {validation.passed_checks}/{validation.total_checks} checks passed."
            ),
        )

    def _build_analysis_based_package(
        self,
        analysis: SourceAnalysis,
        plan: InstructionPlan,
        language: str,
        level: str,
        topic: str,
        track_mode: str,
        total_days: int,
    ) -> Dict[str, Any]:
        """Build a minimal package directly from analysis results when Gemini synthesis fails.
        This is NOT a generic fallback — it uses actual analysis findings."""

        # Build vocabulary bank from discovered items
        vocab_bank = []
        for v in analysis.vocabulary_items[:8]:
            vocab_bank.append({
                "word": v.item,
                "meaning": f"Extracted from source: {v.category}",
                "pronunciation": "IPA unavailable (model offline)",
                "example_sentence": v.evidence_excerpt or f"Example for: {v.item}",
            })

        # Build study notes from analysis
        study_parts = [f"### Source-Derived Study Guide: {plan.lesson_title}\n"]
        study_parts.append(f"**Source Coverage:** {analysis.source_coverage_summary}\n")

        if analysis.grammar_structures:
            study_parts.append("**Grammar Structures Found in Source:**")
            for g in analysis.grammar_structures[:6]:
                study_parts.append(f"- {g.item}")
                if g.evidence_excerpt:
                    study_parts.append(f"  > Source evidence: \"{g.evidence_excerpt}\"")
            study_parts.append("")

        if analysis.vocabulary_items:
            study_parts.append("**Vocabulary from Source:**")
            study_parts.append("| Word | Category | Source Evidence |")
            study_parts.append("|---|---|---|")
            for v in analysis.vocabulary_items[:10]:
                excerpt = (v.evidence_excerpt or "")[:50]
                study_parts.append(f"| {v.item} | {v.category} | {excerpt} |")
            study_parts.append("")

        if analysis.expressions_idioms:
            study_parts.append("**Expressions & Idioms:**")
            for e in analysis.expressions_idioms[:5]:
                study_parts.append(f"- {e.item}")

        study_notes = "\n".join(study_parts)

        # Build exercises from plan
        exercises = []
        solutions = []
        for i, pe in enumerate(plan.planned_exercises[:3]):
            q = f"Q{i+1}: {pe.exercise_type} exercise for '{pe.target_concept}'"
            exercises.append(q)
            solutions.append({
                "question": q,
                "answer": f"[Answer requires model generation - based on {pe.target_concept}]",
                "explanation": f"This tests {pe.target_concept} from the source material.",
            })

        # Build dialogues from source expressions
        dialogues = []
        for e in analysis.expressions_idioms[:4]:
            dialogues.append(f"Speaker: {e.item}")

        day_lesson = {
            "day_number": 1,
            "module_week": f"Week 1: {plan.lesson_focus}",
            "day_topic": f"Day 1: {plan.lesson_title}",
            "grammar_rules_detail": (
                f"Grammar structures from source: "
                + ", ".join(g.item for g in analysis.grammar_structures[:5])
                if analysis.grammar_structures
                else f"Grammar rules were not explicitly found in the provided source materials for {topic}."
            ),
            "video_breakdown_analysis": (
                "Source material analysis is based on uploaded text/documents. "
                "No audio/video characteristics were analyzed."
            ),
            "study_notes_markdown": study_notes,
            "vocabulary_bank": vocab_bank,
            "classroom_dialogues": dialogues or [f"[Dialogue generation requires AI model for {language}]"],
            "pedagogical_instructions": (
                f"This lesson is derived from uploaded source materials. "
                f"Focus on the {len(analysis.vocabulary_items)} vocabulary items and "
                f"{len(analysis.grammar_structures)} grammar structures discovered in the source."
            ),
            "in_class_exercises": exercises or ["[Exercise generation requires AI model]"],
            "exercise_solutions": solutions,
            "homework_tasks": [
                f"Review the vocabulary items extracted from the source material.",
                f"Practice the grammar structures identified in today's lesson.",
            ],
        }

        return {
            "session_plan": {
                "session_title": f"{plan.lesson_title} - Source Analysis Package",
                "target_language": language,
                "target_level": level,
                "track_mode": track_mode,
                "total_curriculum_days": total_days,
                "curriculum_overview_summary": (
                    f"This package was generated from source evidence analysis. "
                    f"{analysis.source_coverage_summary} "
                    f"Note: Full AI synthesis was unavailable; content is derived directly from source analysis."
                ),
                "learning_objectives": analysis.learning_outcomes_inferred[:3] or [
                    f"Study the concepts found in the uploaded source materials for {topic}"
                ],
                "grammar_focus": [g.item for g in analysis.grammar_structures[:3]] or [
                    f"Grammar focus from source for {topic}"
                ],
                "key_vocabulary": [v.item for v in analysis.vocabulary_items[:5]] or [
                    f"Key terms from source for {topic}"
                ],
                "day_wise_syllabus": [day_lesson],
                "homework_and_practice": [
                    "Review extracted vocabulary and grammar from source materials.",
                ],
            },
            "teacher_materials": {
                "presentation_title": plan.lesson_title,
                "subtitle": f"{language} {level} — Source-Derived Materials",
                "slides": [
                    {
                        "slide_number": 1,
                        "slide_title": f"{plan.lesson_title}",
                        "bullet_points": [
                            f"Topics covered: {', '.join(analysis.main_topics[:3])}",
                            f"Vocabulary items: {len(analysis.vocabulary_items)}",
                            f"Grammar structures: {len(analysis.grammar_structures)}",
                        ],
                        "teacher_cue": "Review the source materials with students.",
                    }
                ],
                "handout_summary_markdown": study_notes,
            },
            "student_lsrw": {
                "listening": {
                    "audio_transcript_passage": (
                        dialogues[0] if dialogues
                        else f"[Listening passage for {topic} requires AI synthesis]"
                    ),
                    "audio_script_dialogue": (
                        "\n".join(dialogues[:2]) if dialogues
                        else f"[Dialogue for {topic} requires AI synthesis]"
                    ),
                    "comprehension_questions": [
                        {
                            "question_number": 1,
                            "question": exercises[0] if exercises else f"[Question about {topic}]",
                            "options": ["Option A", "Option B", "Option C", "Option D"],
                            "correct_answer": "Option A",
                            "explanation": "Based on source analysis.",
                        }
                    ],
                },
                "reading": {
                    "passage_title": f"{topic} — Reading Material",
                    "reading_text": study_notes[:500],
                    "vocabulary_glossary": {
                        v.item: f"{v.category}" for v in analysis.vocabulary_items[:3]
                    } or {"[term]": "[meaning]"},
                    "comprehension_questions": [
                        {
                            "question_number": 1,
                            "question": f"What are the key concepts covered in this source material about {topic}?",
                            "options": analysis.main_topics[:4] or ["Topic A", "Topic B", "Topic C", "Topic D"],
                            "correct_answer": analysis.main_topics[0] if analysis.main_topics else "Topic A",
                            "explanation": "Based on source evidence analysis.",
                        }
                    ],
                },
                "speaking": {
                    "situation_prompt": f"Practice using the vocabulary from {topic} in a conversational setting.",
                    "roleplay_scenario": f"You are discussing {topic} with a language partner.",
                    "pronunciation_hints": [
                        p.item for p in analysis.pronunciation_observations[:2]
                    ] or ["Focus on clear articulation of new vocabulary."],
                    "guiding_questions": [f"What did you learn about {t}?" for t in analysis.main_topics[:3]] or [f"Discuss {topic}"],
                    "sample_dialogue_answer": dialogues[0] if dialogues else f"[Sample dialogue for {topic}]",
                },
                "writing": {
                    "task_prompt": f"Write a short paragraph about {topic} using vocabulary from the source materials.",
                    "word_count_guideline": "50-80 words",
                    "guiding_hints": [
                        f"Use at least 3 vocabulary items: {', '.join(v.item for v in analysis.vocabulary_items[:3])}"
                    ] if analysis.vocabulary_items else ["Use vocabulary from the lesson."],
                    "sample_model_response": f"[Model response for {topic} requires AI synthesis]",
                    "evaluation_rubrics": [
                        {
                            "criteria_name": "Source Vocabulary Usage",
                            "weight_percentage": 40,
                            "grading_prompt_instructions": "Check that vocabulary from the source material is used correctly.",
                        },
                        {
                            "criteria_name": "Grammar Accuracy",
                            "weight_percentage": 30,
                            "grading_prompt_instructions": "Verify correct application of grammar structures.",
                        },
                        {
                            "criteria_name": "Task Completion",
                            "weight_percentage": 30,
                            "grading_prompt_instructions": "Verify the prompt requirements were met.",
                        },
                    ],
                },
            },
        }
