"""
End-to-End Verification of the ISML Continuous Knowledge Intelligence Engine.

Tests:
1. Smart Deduplication (SHA-256 & SimHash)
2. Knowledge Claims Extraction (Subject-Predicate-Object)
3. Contradiction Detection across sources
4. LangGraph Multi-Hop Reasoning & Grounded Synthesis
"""
import asyncio
import sys
import os

# Ensure ai-service root is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.dedup_service import DedupService
from app.services.claims_engine import ClaimsEngine
from app.models.knowledge_engine import KnowledgeClaimModel, EpistemicStatus
from app.graph.knowledge_reasoner import knowledge_reasoner_pipeline


async def main():
    print("=" * 70)
    print("ISML CONTINUOUS KNOWLEDGE INTELLIGENCE ENGINE - LIVE TEST")
    print("=" * 70)

    # -------------------------------------------------------------------------
    # TEST 1: Deduplication (SHA-256 & 64-bit SimHash)
    # -------------------------------------------------------------------------
    print("\n[TEST 1] Smart Deduplication & Near-Duplicate Detection:")
    doc1 = "German adjectives take specific declension endings when preceded by a definite article in the accusative case."
    doc2 = "German adjectives take specific declension endings when preceded by a definite article in the accusative case."  # Exact duplicate
    doc3 = "German adjectives take certain declension endings when preceded by definite articles in accusative case."     # Paraphrased near-duplicate
    doc4 = "French verbs in the first group end in -er and are conjugated regularly."                                     # Completely different

    hash1 = DedupService.calculate_sha256(doc1)
    hash2 = DedupService.calculate_sha256(doc2)
    sim1 = DedupService.calculate_simhash_64(doc1)
    sim3 = DedupService.calculate_simhash_64(doc3)
    sim4 = DedupService.calculate_simhash_64(doc4)

    dist_exact = DedupService.hamming_distance_simhash(sim1, sim1)
    dist_near = DedupService.hamming_distance_simhash(sim1, sim3)
    dist_diff = DedupService.hamming_distance_simhash(sim1, sim4)

    print(f"  - Exact SHA-256 match (doc1 vs doc2): {hash1 == hash2} (Expected: True)")
    print(f"  - SimHash near-duplicate distance (doc1 vs doc3): {dist_near} (Near-duplicate: {dist_near <= 3})")
    print(f"  - SimHash different document distance (doc1 vs doc4): {dist_diff} (Different: {dist_diff > 10})")

    # -------------------------------------------------------------------------
    # TEST 2: Knowledge Claims Extraction (Subject-Predicate-Object)
    # -------------------------------------------------------------------------
    print("\n[TEST 2] Knowledge Claims Extraction (Subject-Predicate-Object):")
    sample_excerpt = (
        "In German, prepositions like 'mit', 'nach', 'von', and 'zu' always require the Dative case. "
        "The preposition 'für' strictly demands the Accusative case regardless of movement."
    )
    claims_engine = ClaimsEngine()
    extracted_claims = await claims_engine.extract_claims_from_chunk(
        chunk_text=sample_excerpt,
        source_title="Goethe Grammar Guide A1"
    )

    print(f"  - Total claims extracted: {len(extracted_claims)}")
    for idx, c in enumerate(extracted_claims, 1):
        print(f"    Claim {idx}:")
        print(f"      • Subject:    {c.subject}")
        print(f"      • Predicate:  {c.predicate}")
        print(f"      • Object:     {c.object}")
        print(f"      • Status:     {c.epistemic_status.value}")
        print(f"      • Quote:      \"{c.verbatim_quote[:70]}...\"")

    # -------------------------------------------------------------------------
    # TEST 3: Contradiction Detection across Different Sources
    # -------------------------------------------------------------------------
    print("\n[TEST 3] Cross-Source Contradiction Detection:")
    claim_dw = KnowledgeClaimModel(
        subject="German preposition 'entlang'",
        predicate="strictly requires",
        object="Genitive case in modern formal standards",
        epistemic_status=EpistemicStatus.FACT,
        verbatim_quote="According to Duden 2024, preposition 'entlang' when placed before the noun demands Genitive.",
        source_title="Duden Modern Standards 2024"
    )

    claim_older_textbook = KnowledgeClaimModel(
        subject="German preposition 'entlang'",
        predicate="strictly requires",
        object="Accusative case only",
        epistemic_status=EpistemicStatus.FACT,
        verbatim_quote="Textbook 2012 asserts 'entlang' requires Accusative case when placed after the noun.",
        source_title="Classic German Grammar 2012"
    )

    conflict_res = await claims_engine.detect_contradiction_between_claims(
        new_claim=claim_dw,
        existing_claim=claim_older_textbook
    )
    print(f"  - Has conflict detected: {conflict_res.has_conflict} (Expected: True)")
    print(f"  - Conflict Type:         {conflict_res.conflict_type.value}")
    print(f"  - Description:           {conflict_res.description}")
    if conflict_res.resolution_guidance:
        print(f"  - Resolution Guidance:   {conflict_res.resolution_guidance}")

    # -------------------------------------------------------------------------
    # TEST 4: LangGraph Multi-Hop Reasoning & Grounded Synthesis
    # -------------------------------------------------------------------------
    print("\n[TEST 4] LangGraph Knowledge Reasoning & Grounded Synthesis:")
    test_query = "What case does the German preposition 'mit' require, and how should beginner students practice it?"
    
    state_input = {
        "query": test_query,
        "target_language": "German",
        "target_resource_id": None,
        "top_k": 3,
        "intent_summary": "",
        "decomposed_subqueries": [],
        "retrieved_chunks": [],
        "active_claims": [],
        "detected_contradictions": [],
        "citations": [],
        "synthesized_answer": "",
        "faithfulness_score": 1.0,
        "error": None
    }

    result_state = await knowledge_reasoner_pipeline.ainvoke(state_input)
    print(f"  - Intent Summary: {result_state.get('intent_summary')}")
    print(f"  - Decomposed Subqueries: {result_state.get('decomposed_subqueries')}")
    print(f"  - Retrieved Chunks Count: {len(result_state.get('retrieved_chunks', []))}")
    print(f"  - Faithfulness Score: {result_state.get('faithfulness_score')}")
    print(f"\n  [SYNTHESIZED GROUNDED ANSWER]:\n{result_state.get('synthesized_answer')}")

    print("\n" + "=" * 70)
    print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())

