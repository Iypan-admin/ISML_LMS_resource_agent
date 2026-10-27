"""
Stage E & F: Evidence Validator and Quality Evaluator.

Validates generated content against source evidence.
Evaluates overall quality with explicit, testable criteria.
"""
import logging
from typing import Dict, Any, List, Optional

from app.models.source_evidence import (
    SourceAnalysis,
    InstructionPlan,
    ValidationReport,
    ValidationIssue,
    QualityReport,
    QualityDimension,
)

logger = logging.getLogger(__name__)


class EvidenceValidator:
    """Validates generated lesson content against source evidence and instruction plan."""

    def validate(
        self,
        generated_data: Dict[str, Any],
        analysis: SourceAnalysis,
        plan: InstructionPlan,
        language: str,
        level: str,
    ) -> ValidationReport:
        """Run deterministic validation checks on generated content."""
        issues: List[ValidationIssue] = []
        total_checks = 0
        passed_checks = 0

        session_plan = generated_data.get("session_plan", {})
        day_syllabus = session_plan.get("day_wise_syllabus", [])

        # Check 1: JSON structure has required top-level keys
        total_checks += 1
        required_keys = ["session_plan", "teacher_materials", "student_lsrw"]
        missing_keys = [k for k in required_keys if k not in generated_data]
        if missing_keys:
            issues.append(ValidationIssue(
                issue_type="schema_error",
                severity="error",
                description=f"Missing required top-level keys: {missing_keys}",
                field_path="root",
            ))
        else:
            passed_checks += 1

        # Check 2: Day syllabus is non-empty
        total_checks += 1
        if not day_syllabus:
            issues.append(ValidationIssue(
                issue_type="schema_error",
                severity="error",
                description="day_wise_syllabus is empty",
                field_path="session_plan.day_wise_syllabus",
            ))
        else:
            passed_checks += 1

        # Check 3: Each day has required fields
        for idx, day in enumerate(day_syllabus):
            total_checks += 1
            required_day_fields = ["day_number", "day_topic", "study_notes_markdown"]
            missing_day = [f for f in required_day_fields if not day.get(f)]
            if missing_day:
                issues.append(ValidationIssue(
                    issue_type="schema_error",
                    severity="warning",
                    description=f"Day {idx+1} missing fields: {missing_day}",
                    field_path=f"session_plan.day_wise_syllabus[{idx}]",
                ))
            else:
                passed_checks += 1

        # Check 4: Vocabulary bank items have structure
        for idx, day in enumerate(day_syllabus):
            vocab = day.get("vocabulary_bank", [])
            total_checks += 1
            if vocab:
                invalid_vocab = [v for v in vocab if not isinstance(v, dict) or not v.get("word")]
                if invalid_vocab:
                    issues.append(ValidationIssue(
                        issue_type="schema_error",
                        severity="warning",
                        description=f"Day {idx+1}: {len(invalid_vocab)} vocab items missing 'word' field",
                        field_path=f"session_plan.day_wise_syllabus[{idx}].vocabulary_bank",
                    ))
                else:
                    passed_checks += 1
            else:
                passed_checks += 1  # Empty vocab is acceptable if plan didn't require it

        # Check 5: Exercise solutions have answers
        for idx, day in enumerate(day_syllabus):
            solutions = day.get("exercise_solutions", [])
            total_checks += 1
            if solutions:
                missing_answers = [s for s in solutions if isinstance(s, dict) and not s.get("answer")]
                if missing_answers:
                    issues.append(ValidationIssue(
                        issue_type="incorrect_answer",
                        severity="warning",
                        description=f"Day {idx+1}: {len(missing_answers)} exercises missing answers",
                        field_path=f"session_plan.day_wise_syllabus[{idx}].exercise_solutions",
                    ))
                else:
                    passed_checks += 1
            else:
                passed_checks += 1

        # Check 6: Evidence coverage — do generated vocab items relate to source findings?
        if analysis.has_sufficient_evidence() and analysis.vocabulary_items:
            source_vocab_set = {v.item.lower().strip() for v in analysis.vocabulary_items}
            for idx, day in enumerate(day_syllabus):
                total_checks += 1
                gen_vocab = day.get("vocabulary_bank", [])
                if gen_vocab:
                    gen_words = {v.get("word", "").lower().strip() for v in gen_vocab if isinstance(v, dict)}
                    overlap = gen_words & source_vocab_set
                    if not overlap and gen_words:
                        issues.append(ValidationIssue(
                            issue_type="unsupported_claim",
                            severity="warning",
                            description=(
                                f"Day {idx+1}: None of the {len(gen_words)} generated vocabulary items "
                                f"match source evidence vocabulary. Generated: {list(gen_words)[:5]}. "
                                f"Source had: {list(source_vocab_set)[:5]}"
                            ),
                            field_path=f"session_plan.day_wise_syllabus[{idx}].vocabulary_bank",
                            suggestion="Verify generated vocabulary is grounded in source material.",
                        ))
                    else:
                        passed_checks += 1
                else:
                    passed_checks += 1

        # Check 7: study_notes_markdown is not a placeholder
        for idx, day in enumerate(day_syllabus):
            total_checks += 1
            notes = day.get("study_notes_markdown", "")
            placeholder_markers = ["continue similarly", "etc.", "[insert", "placeholder", "TBD"]
            found_placeholders = [m for m in placeholder_markers if m.lower() in notes.lower()]
            if found_placeholders:
                issues.append(ValidationIssue(
                    issue_type="unsupported_claim",
                    severity="warning",
                    description=f"Day {idx+1}: study_notes_markdown contains placeholder text: {found_placeholders}",
                    field_path=f"session_plan.day_wise_syllabus[{idx}].study_notes_markdown",
                ))
            else:
                passed_checks += 1

        # Evidence coverage ratio
        coverage = passed_checks / total_checks if total_checks > 0 else 0.0

        has_errors = any(i.severity == "error" for i in issues)
        warnings = [i.description for i in issues if i.severity == "warning"]

        return ValidationReport(
            is_valid=not has_errors,
            total_checks=total_checks,
            passed_checks=passed_checks,
            issues=issues,
            evidence_coverage_ratio=round(coverage, 2),
            warnings=warnings,
        )


class QualityEvaluator:
    """Evaluates the completed package against explicit quality criteria."""

    def evaluate(
        self,
        generated_data: Dict[str, Any],
        analysis: SourceAnalysis,
        plan: InstructionPlan,
        validation: ValidationReport,
    ) -> QualityReport:
        """Run quality evaluation with explicit, testable criteria."""
        dimensions: List[QualityDimension] = []
        warnings: List[str] = []

        session_plan = generated_data.get("session_plan", {})
        day_syllabus = session_plan.get("day_wise_syllabus", [])

        # 1. Source relevance
        if analysis.has_sufficient_evidence():
            # Check that lesson title or topics relate to source
            title = session_plan.get("session_title", "").lower()
            topic_match = any(t.lower() in title for t in analysis.main_topics[:3]) if analysis.main_topics else False
            dimensions.append(QualityDimension(
                dimension="source_relevance",
                meets_criteria=topic_match or bool(analysis.main_topics),
                notes="Lesson title reflects source topics." if topic_match else "Lesson title may not reflect source content precisely.",
            ))
        else:
            dimensions.append(QualityDimension(
                dimension="source_relevance",
                meets_criteria=False,
                notes="No source evidence available to assess relevance.",
            ))

        # 2. Instructional coherence — at least one day has study notes
        has_notes = any(d.get("study_notes_markdown") for d in day_syllabus)
        dimensions.append(QualityDimension(
            dimension="instructional_coherence",
            meets_criteria=has_notes,
            notes="Study notes present." if has_notes else "No study notes found in any day.",
        ))

        # 3. Exercise-answer consistency
        all_have_answers = True
        for day in day_syllabus:
            for sol in day.get("exercise_solutions", []):
                if isinstance(sol, dict) and not sol.get("answer"):
                    all_have_answers = False
                    break
        dimensions.append(QualityDimension(
            dimension="exercise_answer_consistency",
            meets_criteria=all_have_answers,
            notes="All exercises have answers." if all_have_answers else "Some exercises missing answers.",
        ))

        # 4. Schema validity (from validation)
        dimensions.append(QualityDimension(
            dimension="schema_validity",
            meets_criteria=validation.is_valid,
            notes=f"{validation.passed_checks}/{validation.total_checks} checks passed.",
        ))

        # 5. No filler/placeholder
        has_filler = any(
            i.issue_type == "unsupported_claim" and "placeholder" in i.description.lower()
            for i in validation.issues
        )
        dimensions.append(QualityDimension(
            dimension="no_filler_content",
            meets_criteria=not has_filler,
            notes="No placeholder content detected." if not has_filler else "Placeholder content detected.",
        ))

        # Overall assessment
        failing_dims = [d for d in dimensions if not d.meets_criteria]
        critical_failures = [d for d in failing_dims if d.dimension in ("schema_validity", "instructional_coherence")]

        if critical_failures:
            recommendation = "reject"
        elif len(failing_dims) > 2:
            recommendation = "revise"
        else:
            recommendation = "accept"

        return QualityReport(
            overall_acceptable=recommendation == "accept",
            dimensions=dimensions,
            warnings=warnings + [f"Dimension '{d.dimension}' did not meet criteria: {d.notes}" for d in failing_dims],
            recommendation=recommendation,
        )
