"""
Stage B: Source Evidence Analyzer.

Analyzes extracted source materials to discover actual pedagogical content.
Produces structured SourceAnalysis with traceable evidence items.
"""
import json
import logging
from typing import Optional

import httpx

from app.config.settings import settings
from app.models.source_evidence import (
    ExtractionBundle,
    SourceAnalysis,
    EvidenceItem,
)

logger = logging.getLogger(__name__)

# Maximum chars of source text to send in analysis prompt
_MAX_ANALYSIS_CONTEXT = 60_000


class SourceAnalyzerAgent:
    """Analyzes extracted source evidence to discover instructional content."""

    async def _call_gemini_json(self, prompt: str, max_tokens: int = 4096) -> Optional[dict]:
        """Call Gemini with JSON response mode."""
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY.startswith("AQ.placeholder"):
            return None

        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{settings.LLM_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": max_tokens,
                "response_mime_type": "application/json",
            },
        }
        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        raw = candidates[0]["content"]["parts"][0]["text"]
                        return self._parse_json_safe(raw)
                else:
                    logger.warning(f"Gemini analysis call returned {resp.status_code}: {resp.text[:300]}")
        except Exception as e:
            logger.warning(f"Gemini analysis call failed: {e}")
        return None

    @staticmethod
    def _parse_json_safe(raw: str) -> Optional[dict]:
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
        except json.JSONDecodeError:
            import re
            match = re.search(r'(\{[\s\S]*\})', clean)
            if match:
                try:
                    return json.loads(match.group(1), strict=False)
                except json.JSONDecodeError:
                    pass
        return None

    def _build_analysis_prompt(
        self,
        source_text: str,
        language: str,
        level: str,
        topic: str,
    ) -> str:
        """Build the source analysis prompt. This is NOT a lesson-generation prompt.
        It instructs Gemini to discover what the source actually contains."""

        # Truncate source for context budget
        truncated = source_text[:_MAX_ANALYSIS_CONTEXT]
        was_truncated = len(source_text) > _MAX_ANALYSIS_CONTEXT

        truncation_note = ""
        if was_truncated:
            truncation_note = (
                f"\nNOTE: The source text was truncated from {len(source_text)} to "
                f"{_MAX_ANALYSIS_CONTEXT} characters. Analysis covers the available portion only."
            )

        return f"""You are a linguistic content analyst. Your task is to examine the source material below and discover what instructional content it actually contains.

CONTEXT:
- Target Language: {language}
- Target Proficiency Level: {level}
- Course Topic: {topic}
{truncation_note}

SOURCE MATERIAL TO ANALYZE:
\"\"\"
{truncated}
\"\"\"

INSTRUCTIONS:
Analyze the source material and identify what it actually teaches or covers. Do NOT invent content that is not present in the source. For each finding, note where in the source it appears.

If the source is empty, very short, or does not contain usable instructional content, return empty lists and set evidence_density to "none" or "low".

Return JSON with this structure:
{{
  "main_topics": ["topic discovered in source"],
  "subtopics": ["supporting subtopic found"],
  "vocabulary_items": [
    {{"item": "word or phrase from source", "category": "vocabulary", "evidence_excerpt": "verbatim excerpt where it appears", "confidence": "high"}}
  ],
  "grammar_structures": [
    {{"item": "grammar rule or pattern found", "category": "grammar", "evidence_excerpt": "excerpt showing this rule", "confidence": "high"}}
  ],
  "expressions_idioms": [
    {{"item": "expression found in source", "category": "expression", "evidence_excerpt": "excerpt", "confidence": "high"}}
  ],
  "example_sentences": [
    {{"item": "actual example from source", "category": "example", "evidence_excerpt": "exact sentence from source", "confidence": "high"}}
  ],
  "communicative_situations": ["situation or scenario covered in source"],
  "learning_outcomes_inferred": ["what a student would learn from this material"],
  "pronunciation_observations": [],
  "cultural_context": ["cultural information present in source"],
  "prerequisite_knowledge": ["what the learner needs to know before this"],
  "gaps": ["important aspects not covered by the source"],
  "ambiguities": ["unclear or contradictory points in source"],
  "source_coverage_summary": "Brief narrative of what the source covers and its instructional scope",
  "evidence_density": "high or medium or low or none"
}}

RULES:
1. Only report vocabulary, grammar, and examples that ACTUALLY APPEAR in the source text.
2. Use the "evidence_excerpt" field to include a SHORT verbatim quote from the source proving the finding exists.
3. Do not claim to have analyzed audio characteristics unless the source text explicitly describes them.
4. If the source is in {language}, extract items in {language}. If explanations are in another language, note that.
5. Set confidence to "low" for uncertain findings.
6. Return valid JSON only."""

    async def analyze(
        self,
        extraction_bundle: ExtractionBundle,
        language: str,
        level: str,
        topic: str,
    ) -> SourceAnalysis:
        """Run source evidence analysis. Returns structured findings."""

        if not extraction_bundle.has_usable_evidence():
            logger.info("No usable source evidence available for analysis.")
            return SourceAnalysis(
                source_coverage_summary="No source material was provided or extraction failed. Cannot perform evidence-based analysis.",
                evidence_density="none",
                gaps=["No source material available for analysis"],
            )

        prompt = self._build_analysis_prompt(
            source_text=extraction_bundle.combined_text,
            language=language,
            level=level,
            topic=topic,
        )

        result = await self._call_gemini_json(prompt, max_tokens=4096)

        if not result:
            logger.warning("Source analysis Gemini call returned no result.")
            return SourceAnalysis(
                source_coverage_summary="Source analysis could not be completed (model unavailable or returned invalid response).",
                evidence_density="unknown",
                gaps=["Source analysis failed - model did not return valid results"],
            )

        # Parse into structured model
        try:
            analysis = SourceAnalysis(
                main_topics=result.get("main_topics", []),
                subtopics=result.get("subtopics", []),
                vocabulary_items=[
                    EvidenceItem(**v) for v in result.get("vocabulary_items", [])
                    if isinstance(v, dict) and v.get("item")
                ],
                grammar_structures=[
                    EvidenceItem(**g) for g in result.get("grammar_structures", [])
                    if isinstance(g, dict) and g.get("item")
                ],
                expressions_idioms=[
                    EvidenceItem(**e) for e in result.get("expressions_idioms", [])
                    if isinstance(e, dict) and e.get("item")
                ],
                example_sentences=[
                    EvidenceItem(**e) for e in result.get("example_sentences", [])
                    if isinstance(e, dict) and e.get("item")
                ],
                communicative_situations=result.get("communicative_situations", []),
                learning_outcomes_inferred=result.get("learning_outcomes_inferred", []),
                pronunciation_observations=[
                    EvidenceItem(**p) for p in result.get("pronunciation_observations", [])
                    if isinstance(p, dict) and p.get("item")
                ],
                cultural_context=result.get("cultural_context", []),
                prerequisite_knowledge=result.get("prerequisite_knowledge", []),
                gaps=result.get("gaps", []),
                ambiguities=result.get("ambiguities", []),
                source_coverage_summary=result.get("source_coverage_summary", ""),
                evidence_density=result.get("evidence_density", "medium"),
            )
            logger.info(
                f"Source analysis complete: {len(analysis.vocabulary_items)} vocab, "
                f"{len(analysis.grammar_structures)} grammar, "
                f"{len(analysis.expressions_idioms)} expressions, "
                f"density={analysis.evidence_density}"
            )
            return analysis
        except Exception as e:
            logger.warning(f"Failed to parse source analysis result: {e}")
            return SourceAnalysis(
                source_coverage_summary="Source analysis parsing failed.",
                evidence_density="unknown",
                gaps=["Analysis result could not be parsed into structured format"],
            )
