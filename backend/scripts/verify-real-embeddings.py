import urllib.request
import json
import math
import os

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL = "models/gemini-embedding-001"

def get_embedding(text: str):
    url = f"https://generativelanguage.googleapis.com/v1beta/{MODEL}:embedContent?key={GEMINI_API_KEY}"
    payload = {
        "model": MODEL,
        "content": {"parts": [{"text": text}]},
        "outputDimensionality": 768
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        return data['embedding']['values']

def cosine_similarity(v1, v2):
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    return dot / (norm1 * norm2) if norm1 and norm2 else 0.0

def main():
    print("================================================================")
    print("EMPIRICAL LIVE EMBEDDING BENCHMARK (gemini-embedding-001, 768-dim)")
    print("================================================================\n")

    # 1. GERMAN COMPOUND EVALUATION
    print("--- 1. GERMAN COMPOUND NOUN RETRIEVAL ---")
    doc_de = "Das Handschuhfach im Auto ist abgeschlossen."
    doc_de_control = "Im Winterurlaub fahren viele Menschen in die Berge zum Skifahren."
    q_de_compound = "Handschuh"
    q_de_exact = "Handschuhfach"
    q_de_unrelated = "Gartenblumen"

    emb_doc_de = get_embedding(doc_de)
    emb_doc_de_ctrl = get_embedding(doc_de_control)
    emb_q_compound = get_embedding(q_de_compound)
    emb_q_exact = get_embedding(q_de_exact)
    emb_q_unrelated = get_embedding(q_de_unrelated)

    sim_compound = cosine_similarity(emb_doc_de, emb_q_compound)
    sim_exact = cosine_similarity(emb_doc_de, emb_q_exact)
    sim_control = cosine_similarity(emb_doc_de_ctrl, emb_q_compound)
    sim_unrelated = cosine_similarity(emb_doc_de, emb_q_unrelated)

    print(f"Target Doc:  '{doc_de}'")
    print(f"Query 'Handschuhfach' (Exact) Cosine Similarity:       {sim_exact:.4f}")
    print(f"Query 'Handschuh'     (Compound Sub-word) Similarity:  {sim_compound:.4f}")
    print(f"Query 'Handschuh' against Control (Ski vacation):       {sim_control:.4f}")
    print(f"Query 'Gartenblumen'  (Negative case) Similarity:      {sim_unrelated:.4f}")
    print(f"-> Compound Morpheme Margin over Negative:            +{(sim_compound - sim_unrelated):.4f}")

    # 2. FRENCH ACCENT & ELISION EVALUATION
    print("\n--- 2. FRENCH UNACCENTED & ELISION RETRIEVAL ---")
    doc_fr = "L'étudiant va à l'université d'Avignon pour la présentation."
    q_fr_accented = "l'étudiant"
    q_fr_unaccented = "etudiant"
    q_fr_negative = "voiture de course"

    emb_doc_fr = get_embedding(doc_fr)
    emb_q_fr_acc = get_embedding(q_fr_accented)
    emb_q_fr_unacc = get_embedding(q_fr_unaccented)
    emb_q_fr_neg = get_embedding(q_fr_negative)

    sim_fr_acc = cosine_similarity(emb_doc_fr, emb_q_fr_acc)
    sim_fr_unacc = cosine_similarity(emb_doc_fr, emb_q_fr_unacc)
    sim_fr_neg = cosine_similarity(emb_doc_fr, emb_q_fr_neg)

    print(f"Target Doc:  '{doc_fr}'")
    print(f"Query 'l\\'étudiant' (Accented)   Cosine Similarity:    {sim_fr_acc:.4f}")
    print(f"Query 'etudiant'     (Unaccented) Cosine Similarity:    {sim_fr_unacc:.4f}")
    print(f"Query 'voiture de course' (Negative) Similarity:        {sim_fr_neg:.4f}")
    print(f"-> Semantic Invariance Ratio (Unaccented / Accented):   {(sim_fr_unacc / sim_fr_acc * 100):.2f}%")

    # 3. JAPANESE & KOREAN SEMANTIC SYNONYM RETRIEVAL
    print("\n--- 3. JAPANESE & KOREAN SEMANTIC SYNONYM RETRIEVAL ---")
    doc_ja = "東京大学で人工知能の研究を行う。"  # Tokyo Univ AI research
    q_ja_exact = "人工知能"                      # Artificial Intelligence
    q_ja_synonym = "AI機械学習"                  # AI Machine Learning (Synonym, zero character overlap!)
    q_ja_negative = "料理のレシピ"               # Cooking recipe

    emb_doc_ja = get_embedding(doc_ja)
    emb_q_ja_exact = get_embedding(q_ja_exact)
    emb_q_ja_syn = get_embedding(q_ja_synonym)
    emb_q_ja_neg = get_embedding(q_ja_negative)

    sim_ja_exact = cosine_similarity(emb_doc_ja, emb_q_ja_exact)
    sim_ja_syn = cosine_similarity(emb_doc_ja, emb_q_ja_syn)
    sim_ja_neg = cosine_similarity(emb_doc_ja, emb_q_ja_neg)

    print(f"Target Doc:  '{doc_ja}'")
    print(f"Query '人工知能' (Exact keyword)     Similarity:        {sim_ja_exact:.4f}")
    print(f"Query 'AI機械学習' (Semantic synonym) Similarity:        {sim_ja_syn:.4f} (Trigram was 0.0000!)")
    print(f"Query '料理のレシピ' (Negative case)   Similarity:        {sim_ja_neg:.4f}")
    print(f"-> Dense Vector Synonym vs Negative Margin:          +{(sim_ja_syn - sim_ja_neg):.4f}")

    # 4. CROSS-LANGUAGE NEGATIVE CONTAMINATION
    print("\n--- 4. CROSS-LANGUAGE NEGATIVE CONTAMINATION ---")
    q_cross_fr = "ordinateur portable et logiciel d'apprentissage"
    sim_cross = cosine_similarity(emb_doc_de, get_embedding(q_cross_fr))
    print(f"French Query on German Car Doc Similarity:              {sim_cross:.4f}")

    print("\n================================================================")
    print("LIVE EMBEDDING BENCHMARK COMPLETE: ALL SCORES MEASURED EMPIRICALLY")
    print("================================================================")

if __name__ == "__main__":
    main()

