from typing import Optional
from app.models.analysis import ResourceAnalysisResult
import re

class ResourceAnalysisAgent:
    """Agent for extracting structured metadata from text content or web page."""
    
    async def analyze(
        self,
        content: str,
        known_language_code: Optional[str] = None,
        known_level_code: Optional[str] = None,
    ) -> ResourceAnalysisResult:
        missing_info = []
        evidence = []
        
        # Simple rule-based & structured extraction
        title = "Language Resource Content"
        lines = [l.strip() for l in content.split("\n") if l.strip()]
        if lines:
            title = lines[0][:100]
            evidence.append(f"Extracted title from first line: '{title}'")
        else:
            missing_info.append("Title could not be extracted automatically")
            
        description = content[:250].strip() if len(content) > 250 else content.strip()
        summary = f"Educational content material ({len(content)} characters)."
        
        # Key Vocabulary extraction (heuristic fallback)
        words = re.findall(r'\b[A-Za-zÄäÖöÜüßAccents\'-]{4,}\b', content)
        key_vocab = list(dict.fromkeys(words))[:10]
        
        # Detected CEFR Level
        detected_cefr = known_level_code
        if not detected_cefr:
            for level in ["A1", "A2", "B1", "B2", "C1", "C2"]:
                if f"level {level.lower()}" in content.lower() or f"{level} level" in content.lower() or level in content:
                    detected_cefr = level
                    evidence.append(f"Detected CEFR level '{level}' in content text")
                    break

        if not detected_cefr:
            missing_info.append("CEFR level not explicitly verified in text")

        # Detected Language
        detected_language = known_language_code
        if not detected_language:
            if "der" in content.lower() or "die" in content.lower() or "das" in content.lower() or "und" in content.lower():
                detected_language = "de"
                evidence.append("Detected German language particles ('der', 'die', 'das', 'und')")
            elif "les" in content.lower() or "des" in content.lower() or "avec" in content.lower():
                detected_language = "fr"
                evidence.append("Detected French language particles ('les', 'des', 'avec')")
            elif "los" in content.lower() or "las" in content.lower() or "por" in content.lower():
                detected_language = "es"
                evidence.append("Detected Spanish language particles ('los', 'las', 'por')")

        if not detected_language:
            missing_info.append("Target language code could not be determined with high certainty")

        # Inferred ResourceType
        detected_resource_type = "ARTICLE"
        if "video" in content.lower() or "youtube" in content.lower():
            detected_resource_type = "VIDEO"
        elif "podcast" in content.lower() or "audio" in content.lower():
            detected_resource_type = "AUDIO"
        elif "dialogue" in content.lower() or "conversation" in content.lower():
            detected_resource_type = "DIALOGUE"
        elif "exercise" in content.lower() or "quiz" in content.lower():
            detected_resource_type = "EXERCISE"

        requires_review = len(missing_info) > 0 or detected_cefr is None or detected_language is None
        confidence = "HIGH" if (detected_language and detected_cefr and len(missing_info) == 0) else "MEDIUM" if detected_language else "LOW"

        return ResourceAnalysisResult(
            title=title,
            description=description,
            summary=summary,
            key_vocabulary=key_vocab,
            detected_language=detected_language,
            detected_cefr=detected_cefr,
            detected_resource_type=detected_resource_type,
            suggested_categories=["grammar-cat" if "grammar" in content.lower() else "general"],
            suggested_skills=["speaking-skill" if "speaking" in content.lower() else "reading"],
            suggested_topics=["greetings-topic" if "hello" in content.lower() or "hallo" in content.lower() else "general"],
            confidence=confidence,
            requires_human_review=requires_review,
            missing_information=missing_info,
            evidence=evidence,
        )
