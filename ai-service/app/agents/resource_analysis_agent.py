import json
import logging
import re
from typing import Optional, Dict, Any, List
import httpx

from app.config.settings import settings
from app.models.analysis import ResourceAnalysisResult

logger = logging.getLogger(__name__)


class ResourceAnalysisAgent:
    """Senior AI Agent for analyzing foreign language learning resources.
    Extracts structured educational metadata, linguistic evidence, and pedagogical classifications
    using Gemini LLM with dynamic evidence-based analysis and robust deterministic fallbacks."""

    async def _call_gemini_analysis(self, content: str, known_lang: Optional[str], known_level: Optional[str]) -> Optional[Dict[str, Any]]:
        """Invokes Gemini to analyze raw content and return structured JSON."""
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY.startswith("AQ.placeholder"):
            return None

        # Build dynamic analysis directive — grounded strictly in source content
        context_hints = []
        if known_lang:
            context_hints.append(f"Expected Language Code: {known_lang}")
        if known_level:
            context_hints.append(f"Expected CEFR Level: {known_level}")
        hint_str = f"Context Constraints: {', '.join(context_hints)}" if context_hints else "Analyze strictly from text."

        prompt = f"""You are an expert Applied Linguistics and Language Learning Resource Analyst.
Analyze the following educational material and extract structured pedagogical metadata.

{hint_str}

STRICT EVIDENCE RULES:
1. Ground all classifications in the provided text. Do NOT hallucinate authors, publishers, or claims.
2. Determine the primary target language code (e.g. 'de', 'fr', 'es', 'ja', 'ko', 'en', 'ta').
3. Determine the CEFR level ('A1', 'A2', 'B1', 'B2', 'C1', 'C2' or 'N5'-'N1') based on grammatical complexity and vocabulary density. Provide direct textual evidence.
4. Extract 5-10 key vocabulary terms present in the text with English translations.
5. Identify the resource type: 'ARTICLE', 'VIDEO', 'AUDIO', 'DIALOGUE', 'EXERCISE', or 'WORKSHEET'.
6. If any critical metadata cannot be verified from the text, list it in missing_information.

CONTENT TO ANALYZE (first 4000 characters):
\"\"\"
{content[:4000]}
\"\"\"

Output strictly valid JSON with this schema:
{{
  "title": "Concise, descriptive educational title",
  "description": "2-3 sentence overview of what the resource teaches",
  "summary": "Detailed pedagogical summary of target structures and vocabulary",
  "key_vocabulary": ["term 1", "term 2", "term 3"],
  "detected_language": "iso-code e.g. de/fr/es/ja/ko",
  "detected_cefr": "A1/A2/B1/B2/C1/C2",
  "detected_resource_type": "ARTICLE/DIALOGUE/EXERCISE/VIDEO/AUDIO",
  "suggested_categories": ["grammar", "vocabulary", "communication"],
  "suggested_skills": ["speaking", "reading", "listening", "writing"],
  "suggested_topics": ["topic-name"],
  "confidence": "HIGH" or "MEDIUM" or "LOW",
  "requires_human_review": true or false,
  "missing_information": ["missing detail if any"],
  "evidence": ["quote 1 supporting CEFR or language", "quote 2"]
}}
"""

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 2048,
                "response_mime_type": "application/json"
            }
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0]["content"]["parts"][0]["text"].strip()
                        return json.loads(text)
                else:
                    logger.warning(f"Gemini analysis API returned {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.warning(f"Gemini analysis API call failed: {e}")
        return None

    def _deterministic_analysis(
        self,
        content: str,
        known_language_code: Optional[str] = None,
        known_level_code: Optional[str] = None,
    ) -> ResourceAnalysisResult:
        """Deterministic linguistic extraction fallback when LLM is unavailable."""
        missing_info: List[str] = []
        evidence: List[str] = []

        # 1. Title Extraction: Check first markdown heading or first non-empty line
        title = "Language Learning Resource"
        heading_match = re.search(r"^#+\s*(.+)$", content, re.MULTILINE)
        if heading_match:
            title = heading_match.group(1).strip()[:120]
            evidence.append(f"Title extracted from Markdown header: '{title}'")
        else:
            lines = [l.strip() for l in content.split("\n") if l.strip() and not l.startswith("http")]
            if lines:
                title = lines[0][:100]
                evidence.append(f"Title inferred from opening sentence: '{title}'")
            else:
                missing_info.append("Title could not be extracted automatically")

        # 2. Language Detection
        detected_language = known_language_code
        if not detected_language:
            # Multi-language frequency scoring
            scores = {
                "de": len(re.findall(r'\b(der|die|das|und|ist|ich|nicht|ein|eine|wir|mit)\b', content, re.I)),
                "fr": len(re.findall(r'\b(le|la|les|un|une|est|je|nous|vous|avec|pour|dans)\b', content, re.I)),
                "es": len(re.findall(r'\b(el|la|los|las|un|una|es|por|para|con|en|que)\b', content, re.I)),
                "ja": len(re.findall(r'[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]', content)),
                "ko": len(re.findall(r'[\uAC00-\uD7AF]', content)),
                "ta": len(re.findall(r'[\u0B80-\u0BFF]', content)),
            }
            best_lang = max(scores, key=scores.get)
            if scores[best_lang] > 0:
                detected_language = best_lang
                evidence.append(f"Detected language '{best_lang}' via linguistic frequency score ({scores[best_lang]} markers)")
            else:
                detected_language = None
                missing_info.append("Target language could not be determined with high certainty")

        # 3. CEFR Level Detection
        detected_cefr = known_level_code
        if not detected_cefr:
            for level in ["A1", "A2", "B1", "B2", "C1", "C2", "N5", "N4", "N3", "N2", "N1"]:
                if re.search(r'\b(?:level|niveau|nivel|stufe)?\s*' + re.escape(level) + r'\b', content, re.I):
                    detected_cefr = level.upper()
                    evidence.append(f"Detected CEFR level '{detected_cefr}' explicitly mentioned in text")
                    break

        if not detected_cefr:
            detected_cefr = "A1"
            missing_info.append("CEFR level not explicitly mentioned; defaulted to A1 baseline")

        # 4. Key Vocabulary Extraction
        words = re.findall(r'\b[A-Za-zÄäÖöÜüßÀ-ÿ]{4,}\b', content)
        stop_words = {"this", "that", "with", "from", "have", "more", "about", "your", "will", "would", "could", "should"}
        filtered_words = [w for w in words if w.lower() not in stop_words]
        key_vocab = list(dict.fromkeys(filtered_words))[:10]

        # 5. Resource Type Detection
        detected_resource_type = "ARTICLE"
        content_lower = content.lower()
        if "speaker" in content_lower or "dialogue" in content_lower or ":" in content[:200]:
            detected_resource_type = "DIALOGUE"
        elif "question" in content_lower or "exercise" in content_lower or "quiz" in content_lower or "1." in content:
            detected_resource_type = "EXERCISE"
        elif "youtube" in content_lower or "video" in content_lower or "watch" in content_lower:
            detected_resource_type = "VIDEO"
        elif "audio" in content_lower or "podcast" in content_lower or "listen" in content_lower:
            detected_resource_type = "AUDIO"

        description = content[:250].strip() if len(content) > 250 else content.strip()
        summary = f"Pedagogical language material in {detected_language or 'unknown'} ({len(content)} characters)."

        requires_review = len(missing_info) > 0 or not detected_language
        confidence = "HIGH" if (detected_language and detected_cefr and len(missing_info) == 0) else "MEDIUM" if detected_language else "LOW"

        return ResourceAnalysisResult(
            title=title,
            description=description,
            summary=summary,
            key_vocabulary=key_vocab,
            detected_language=detected_language,
            detected_cefr=detected_cefr,
            detected_resource_type=detected_resource_type,
            suggested_categories=["grammar" if "grammar" in content_lower else "vocabulary" if "vocab" in content_lower else "general"],
            suggested_skills=["speaking" if detected_resource_type == "DIALOGUE" else "reading"],
            suggested_topics=["general"],
            confidence=confidence,
            requires_human_review=requires_review,
            missing_information=missing_info,
            evidence=evidence,
        )

    async def analyze(
        self,
        content: str,
        known_language_code: Optional[str] = None,
        known_level_code: Optional[str] = None,
    ) -> ResourceAnalysisResult:
        """Analyzes text content using Gemini with dynamic extraction, falling back to deterministic linguistic engine."""
        if not content or not content.strip():
            return ResourceAnalysisResult(
                title="Empty Content",
                description="No text content provided",
                summary="Empty resource",
                confidence="LOW",
                requires_human_review=True,
                missing_information=["Content is empty"],
                evidence=[],
            )

        # 1. Try Gemini Analysis Pipeline
        llm_data = await self._call_gemini_analysis(content, known_language_code, known_level_code)
        if llm_data:
            try:
                lang = known_language_code or llm_data.get("detected_language")
                cefr = known_level_code or llm_data.get("detected_cefr")
                return ResourceAnalysisResult(
                    title=llm_data.get("title") or "Language Learning Resource",
                    description=llm_data.get("description") or content[:200],
                    summary=llm_data.get("summary") or "Pedagogical study material.",
                    key_vocabulary=llm_data.get("key_vocabulary") or [],
                    detected_language=lang,
                    detected_cefr=cefr,
                    detected_resource_type=llm_data.get("detected_resource_type") or "ARTICLE",
                    suggested_categories=llm_data.get("suggested_categories") or ["general"],
                    suggested_skills=llm_data.get("suggested_skills") or ["reading"],
                    suggested_topics=llm_data.get("suggested_topics") or ["general"],
                    confidence=llm_data.get("confidence") or "HIGH",
                    requires_human_review=bool(llm_data.get("requires_human_review", True)),
                    missing_information=llm_data.get("missing_information") or [],
                    evidence=llm_data.get("evidence") or ["Analyzed dynamically via Gemini AI model"],
                )
            except Exception as e:
                logger.warning(f"Failed to instantiate ResourceAnalysisResult from LLM JSON: {e}")

        # 2. Fallback to deterministic linguistic engine
        return self._deterministic_analysis(
            content=content,
            known_language_code=known_language_code,
            known_level_code=known_level_code,
        )
