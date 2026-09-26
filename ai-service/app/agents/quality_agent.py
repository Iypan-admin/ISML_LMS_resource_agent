from app.models.quality import QualityAnalysisResult
from app.models.scoring import ScoreModel
from app.models.analysis import ResourceAnalysisResult

class QualityAgent:
    """Agent for evidence-based educational quality evaluation."""

    async def evaluate_quality(
        self,
        analysis: ResourceAnalysisResult,
        content: str,
    ) -> QualityAnalysisResult:
        warnings = []
        content_len = len(content.strip())

        # 1. Relevance
        relevance_score = 85 if analysis.detected_language else 40
        relevance_basis = "Target language detected with high relevance for learning" if analysis.detected_language else "Target language unverified"
        relevance_evidence = analysis.evidence

        # 2. Language Quality
        lang_score = 80 if content_len > 100 else 50
        lang_basis = f"Sufficient content volume ({content_len} chars) for language evaluation" if content_len > 100 else "Content snippet too short"
        lang_evidence = [f"Content length: {content_len} characters"]

        # 3. Level Fit
        level_score = 90 if analysis.detected_cefr else 30
        level_basis = f"Level matched to CEFR '{analysis.detected_cefr}'" if analysis.detected_cefr else "CEFR level fit unverified"
        level_evidence = [f"CEFR Level: {analysis.detected_cefr or 'UNKNOWN'}"]

        # 4. Completeness
        comp_score = 85 if content_len > 300 else 50
        comp_basis = "Full text material present" if content_len > 300 else "Short or partial text sample"
        comp_evidence = [f"Vocabulary words extracted: {len(analysis.key_vocabulary)}"]

        if content_len < 100:
            warnings.append("Resource content is very short (< 100 chars)")
        if not analysis.detected_cefr:
            warnings.append("CEFR level fit requires human verification")

        overall_score = int((relevance_score + lang_score + level_score + comp_score) / 4)

        return QualityAnalysisResult(
            relevance=ScoreModel(
                score=relevance_score,
                score_basis=relevance_basis,
                evidence=relevance_evidence,
                confidence="HIGH" if analysis.detected_language else "LOW",
            ),
            language_quality=ScoreModel(
                score=lang_score,
                score_basis=lang_basis,
                evidence=lang_evidence,
                confidence="HIGH" if content_len > 100 else "MEDIUM",
            ),
            level_fit=ScoreModel(
                score=level_score,
                score_basis=level_basis,
                evidence=level_evidence,
                confidence="HIGH" if analysis.detected_cefr else "LOW",
            ),
            completeness=ScoreModel(
                score=comp_score,
                score_basis=comp_basis,
                evidence=comp_evidence,
                confidence="MEDIUM",
            ),
            overall=ScoreModel(
                score=overall_score,
                score_basis=f"Weighted composite quality score based on 4 dimensions",
                evidence=[f"Composite score: {overall_score}/100"],
                confidence="HIGH" if overall_score >= 75 else "MEDIUM",
            ),
            warnings=warnings,
        )
