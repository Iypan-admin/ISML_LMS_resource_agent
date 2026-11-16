"""
Knowledge Claims Engine & Contradiction Detection Service.

Transforms raw text chunks into atomic (Subject, Predicate, Object) propositions.
Performs semantic NLI-level cross-source contradiction detection.
"""
import json
import logging
import re
from typing import List, Dict, Any, Optional
import httpx

from app.config.settings import settings
from app.models.knowledge_engine import (
    KnowledgeClaimModel,
    EpistemicStatus,
    ContradictionDetectionResult,
    ContradictionType,
)

logger = logging.getLogger(__name__)


class ClaimsEngine:
    """Extracts atomic knowledge propositions and evaluates cross-source contradictions."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.LLM_MODEL or "gemini-3-flash-preview"

    async def _call_llm_json(self, prompt: str, max_tokens: int = 2048) -> Optional[dict]:
        """Calls Gemini with strict JSON mode."""
        if not self.api_key or self.api_key.startswith("AQ.placeholder"):
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": max_tokens,
                "response_mime_type": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        raw = candidates[0]["content"]["parts"][0]["text"]
                        return json.loads(raw)
        except Exception as err:
            logger.warning(f"ClaimsEngine LLM call error: {err}")
        return None

    async def extract_claims_from_chunk(
        self,
        chunk_text: str,
        source_title: str,
        chunk_id: Optional[str] = None,
        resource_id: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> List[KnowledgeClaimModel]:
        """Deconstructs text chunk into atomic Subject-Predicate-Object claims."""
        if not chunk_text.strip():
            return []

        prompt = f"""
You are an expert Knowledge Representation and Ontology Engineer.
Extract all atomic, verifiable factual claims from the provided text excerpt.
DO NOT summarize or merge distinct facts. Deconstruct them into precise (Subject, Predicate, Object) propositions.

Source Document: "{source_title}"
Text:
\"\"\"{chunk_text[:3500]}\"\"\"

Output MUST be a JSON object with this exact structure:
{{
  "claims": [
    {{
      "subject": "Clear concept, entity, grammatical term, or rule",
      "predicate": "Precise relationship, condition, rule, or action",
      "object": "Value, outcome, definition, or target property",
      "epistemic_status": "FACT", // One of: "FACT", "HYPOTHESIS", "OPINION"
      "confidence": 0.95,
      "verbatim_quote": "Exact sentence or snippet from the text supporting this fact"
    }}
  ]
}}
Extract between 3 to 10 high-value claims. Focus on definitions, rules, vocabulary meanings, usage constraints, and facts.
"""
        result = await self._call_llm_json(prompt)
        claims: List[KnowledgeClaimModel] = []

        if result and "claims" in result and isinstance(result["claims"], list):
            for c in result["claims"]:
                try:
                    status = EpistemicStatus(c.get("epistemic_status", "FACT"))
                except ValueError:
                    status = EpistemicStatus.FACT

                claims.append(
                    KnowledgeClaimModel(
                        subject=c.get("subject", "").strip(),
                        predicate=c.get("predicate", "").strip(),
                        object=c.get("object", "").strip(),
                        epistemic_status=status,
                        confidence=float(c.get("confidence", 0.95)),
                        verbatim_quote=c.get("verbatim_quote", "").strip() or chunk_text[:120],
                        chunk_id=chunk_id,
                        resource_id=resource_id,
                        session_id=session_id,
                        source_title=source_title,
                    )
                )
        else:
            # Fallback heuristic extraction if LLM is unavailable
            claims = self._heuristic_claim_extraction(chunk_text, source_title, chunk_id, resource_id, session_id)

        return claims

    def _heuristic_claim_extraction(
        self,
        text: str,
        source_title: str,
        chunk_id: Optional[str] = None,
        resource_id: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> List[KnowledgeClaimModel]:
        """Heuristic rule-based claim extraction when offline."""
        sentences = [s.strip() for s in re.split(r'[.!?\n]', text) if len(s.strip()) > 20]
        claims = []
        for s in sentences[:5]:
            words = s.split()
            subject = " ".join(words[:2]) if len(words) >= 2 else "Topic"
            predicate = "states that"
            obj = " ".join(words[2:]) if len(words) > 2 else s
            claims.append(
                KnowledgeClaimModel(
                    subject=subject,
                    predicate=predicate,
                    object=obj,
                    epistemic_status=EpistemicStatus.FACT,
                    confidence=0.8,
                    verbatim_quote=s,
                    chunk_id=chunk_id,
                    resource_id=resource_id,
                    session_id=session_id,
                    source_title=source_title,
                )
            )
        return claims

    async def detect_contradiction_between_claims(
        self,
        new_claim: KnowledgeClaimModel,
        existing_claim: KnowledgeClaimModel
    ) -> ContradictionDetectionResult:
        """
        Evaluates whether two claims regarding the same or related subjects semantically contradict each other.
        Uses NLI (Natural Language Inference) classification.
        """
        # Quick surface check
        if new_claim.subject.lower() != existing_claim.subject.lower() and \
           new_claim.subject.lower() not in existing_claim.subject.lower() and \
           existing_claim.subject.lower() not in new_claim.subject.lower():
            return ContradictionDetectionResult(has_conflict=False, conflict_type=ContradictionType.NO_CONFLICT)

        prompt = f"""
You are an expert Natural Language Inference (NLI) and Epistemic Contradiction Analyzer.
Analyze the two factual claims below extracted from different sources to determine if they CONTRADICT each other.

Claim A (Source: "{existing_claim.source_title}"):
- Subject: {existing_claim.subject}
- Predicate: {existing_claim.predicate}
- Object: {existing_claim.object}
- Source Quote: "{existing_claim.verbatim_quote}"

Claim B (Source: "{new_claim.source_title}"):
- Subject: {new_claim.subject}
- Predicate: {new_claim.predicate}
- Object: {new_claim.object}
- Source Quote: "{new_claim.verbatim_quote}"

Determine if there is a conflict:
1. "DIRECT_OPPOSITE": One claim affirms what the other denies (e.g. "X takes accusative" vs "X takes dative").
2. "NUMERICAL_DISCREPANCY": Conflicting numbers, dates, durations, or quantities.
3. "TEMPORAL_SUPERSEDENCE": One claim represents an updated version or reform that replaces the other.
4. "NO_CONFLICT": Complementary, independent, or identical facts.

Respond with JSON:
{{
  "has_conflict": true/false,
  "conflict_type": "DIRECT_OPPOSITE" | "NUMERICAL_DISCREPANCY" | "TEMPORAL_SUPERSEDENCE" | "NO_CONFLICT",
  "description": "Clear explanation of the divergence between the two sources",
  "resolution_guidance": "How to interpret both sources (e.g., formal vs informal, different CEFR tiers, updated reform)"
}}
"""
        result = await self._call_llm_json(prompt)
        if result and "has_conflict" in result:
            c_type_str = result.get("conflict_type", "NO_CONFLICT")
            try:
                c_type = ContradictionType(c_type_str)
            except ValueError:
                c_type = ContradictionType.NO_CONFLICT

            return ContradictionDetectionResult(
                has_conflict=bool(result.get("has_conflict", False)),
                conflict_type=c_type,
                claim_a_id=existing_claim.id,
                claim_b_id=new_claim.id,
                description=result.get("description", ""),
                resolution_guidance=result.get("resolution_guidance")
            )

        return ContradictionDetectionResult(has_conflict=False, conflict_type=ContradictionType.NO_CONFLICT)

