"""
Dynamic Prompt Builder for the Session Planner Pipeline.

Contains:
1. SYSTEM_POLICY — stable safety, output format, and evidence rules (NOT lesson content).
2. build_synthesis_prompt() — constructs the Gemini generation prompt dynamically
   from source evidence, analysis results, and instruction plan.

No hardcoded lesson templates, vocabulary, dialogues, or exercises.
"""
from typing import Optional, List
from app.models.source_evidence import (
    SourceAnalysis,
    InstructionPlan,
    EvidenceItem,
)


# =============================================================================
# STABLE SYSTEM POLICY (safety, format, evidence rules — NOT lesson content)
# =============================================================================
SYSTEM_POLICY = """You are an expert educational content generator.

EVIDENCE RULES:
1. Base all instructional content on the SOURCE EVIDENCE and INSTRUCTION PLAN provided.
2. Vocabulary, grammar, examples, and exercises must reflect what was found in the source materials.
3. You may add pedagogical explanations, IPA pronunciation guides, and structured exercises to make the source content teachable — but the CORE CONCEPTS must originate from the evidence.
4. Do NOT invent vocabulary, grammar rules, or cultural facts that are not supported by the source or standard linguistic knowledge.
5. Clearly mark any supplementary content that goes beyond the source (e.g. prerequisite explanations).
6. Do NOT claim to have analyzed audio or video characteristics unless the source evidence explicitly describes them.

OUTPUT RULES:
1. Return ONLY valid JSON matching the requested schema.
2. Escape all inner quotes and backslashes properly.
3. No markdown fences, no preamble, no commentary outside the JSON.
4. Do NOT use placeholder text like "continue similarly", "etc.", "insert here", or "[TBD]".
5. Every exercise must have a complete, verified answer and explanation.

LANGUAGE RULES:
1. Use the target language for examples, vocabulary, dialogues, and exercises.
2. Use the learner-support language (English) for explanations where helpful.
3. Do not create unnatural mixed-language sentences.

QUALITY RULES:
1. Content must be at the appropriate difficulty for the stated proficiency level.
2. Explanations must actually teach — avoid meta-commentary like "this lesson covers..."
3. Tables must use proper markdown formatting.
4. IPA phonetic transcriptions must be accurate."""


# =============================================================================
# DYNAMIC PROMPT BUILDER
# =============================================================================

def _format_evidence_items(items: List[EvidenceItem], label: str, max_items: int = 20) -> str:
    """Format evidence items for inclusion in the synthesis prompt."""
    if not items:
        return ""
    lines = [f"\n{label}:"]
    for item in items[:max_items]:
        excerpt = f' (source: "{item.evidence_excerpt[:80]}...")' if item.evidence_excerpt else ""
        lines.append(f"  - {item.item}{excerpt}")
    return "\n".join(lines)


def _format_planned_sections(plan: InstructionPlan) -> str:
    """Format planned sections into generation directives."""
    if not plan.planned_sections:
        return "Generate sections appropriate to the discovered evidence."

    lines = ["SECTIONS TO GENERATE (based on instruction plan):"]
    for s in plan.planned_sections:
        points = ", ".join(s.key_content_points[:5]) if s.key_content_points else "as evidence supports"
        lines.append(f"  - {s.section_type}: {s.rationale} | Cover: {points}")
    if plan.sections_excluded:
        lines.append(f"\n  OMITTED SECTIONS (not supported by evidence): {', '.join(plan.sections_excluded)}")
    return "\n".join(lines)


def _format_planned_exercises(plan: InstructionPlan) -> str:
    """Format planned exercises into generation directives."""
    if not plan.planned_exercises:
        return "Generate exercises that test the discovered source concepts."

    lines = ["EXERCISE FORMATS TO USE:"]
    for ex in plan.planned_exercises:
        lines.append(f"  - {ex.exercise_type}: testing '{ex.target_concept}' (difficulty: {ex.difficulty})")
    return "\n".join(lines)


def build_synthesis_prompt(
    source_text: str,
    analysis: SourceAnalysis,
    plan: InstructionPlan,
    language: str,
    level: str,
    topic: str,
    track_mode: str,
    total_days: int,
    day_count_to_generate: int = 5,
) -> str:
    """Build the complete Gemini synthesis prompt dynamically from evidence and plan.

    This is NOT a static template. The prompt content changes based on:
    - What the source actually contains (analysis)
    - What the instruction plan decided to teach (plan)
    - The original source text for reference
    """

    # Build evidence summary section
    evidence_sections = []
    evidence_sections.append(_format_evidence_items(analysis.vocabulary_items, "VOCABULARY DISCOVERED IN SOURCE"))
    evidence_sections.append(_format_evidence_items(analysis.grammar_structures, "GRAMMAR STRUCTURES DISCOVERED"))
    evidence_sections.append(_format_evidence_items(analysis.expressions_idioms, "EXPRESSIONS & IDIOMS FOUND"))
    evidence_sections.append(_format_evidence_items(analysis.example_sentences, "EXAMPLE SENTENCES FROM SOURCE"))
    if analysis.communicative_situations:
        evidence_sections.append(f"\nCOMMUNICATIVE SITUATIONS: {', '.join(analysis.communicative_situations)}")
    if analysis.prerequisite_knowledge:
        evidence_sections.append(f"\nPREREQUISITE KNOWLEDGE: {', '.join(analysis.prerequisite_knowledge)}")
    if analysis.gaps:
        evidence_sections.append(f"\nIDENTIFIED GAPS IN SOURCE: {', '.join(analysis.gaps)}")

    evidence_block = "\n".join(s for s in evidence_sections if s)

    # Build instruction directives from plan
    section_directives = _format_planned_sections(plan)
    exercise_directives = _format_planned_exercises(plan)

    # Concepts to teach
    concepts_block = ""
    if plan.concepts_to_explain:
        concepts_block = "CONCEPTS TO EXPLAIN:\n" + "\n".join(f"  - {c}" for c in plan.concepts_to_explain)

    # Source examples to preserve
    preserve_block = ""
    if plan.source_examples_to_preserve:
        preserve_block = "SOURCE EXAMPLES TO PRESERVE VERBATIM:\n" + "\n".join(
            f'  - "{ex}"' for ex in plan.source_examples_to_preserve[:10]
        )

    # Supplementary needs
    supplement_block = ""
    if plan.additional_explanation_needed:
        supplement_block = (
            "ADDITIONAL EXPLANATION NEEDED (supplementary, mark as such):\n"
            + "\n".join(f"  - {n}" for n in plan.additional_explanation_needed)
        )

    # Context window budget: include raw source if under 40K chars
    source_inclusion = ""
    if source_text and len(source_text) <= 40_000:
        source_inclusion = f"""
RAW SOURCE MATERIAL (for reference and grounding):
\"\"\"
{source_text[:40_000]}
\"\"\""""
    elif source_text:
        source_inclusion = f"""
RAW SOURCE MATERIAL (truncated from {len(source_text)} chars for context budget):
\"\"\"
{source_text[:40_000]}
\"\"\""""

    # Build the full prompt
    prompt = f"""{SYSTEM_POLICY}

TARGET LANGUAGE: {language}
PROFICIENCY LEVEL: {level}
COURSE TOPIC: {topic}
TRACK: {track_mode} ({total_days} total days)

================================================================================
INSTRUCTION PLAN (dynamically generated from source analysis):
================================================================================

Lesson Title: {plan.lesson_title}
Lesson Focus: {plan.lesson_focus}

{concepts_block}

{preserve_block}

{supplement_block}

================================================================================
SOURCE EVIDENCE (discovered by analysis):
================================================================================
Coverage: {analysis.source_coverage_summary}
Density: {analysis.evidence_density}

{evidence_block}

================================================================================
GENERATION DIRECTIVES:
================================================================================

{section_directives}

{exercise_directives}

{'' if not plan.unfillable_gaps else 'UNFILLABLE GAPS (do NOT fabricate content for these): ' + ', '.join(plan.unfillable_gaps)}

{source_inclusion}

================================================================================
OUTPUT SCHEMA:
================================================================================

Generate the educational package as strict JSON with this structure:
{{
  "session_plan": {{
    "session_title": "{plan.lesson_title}",
    "target_language": "{language}",
    "target_level": "{level}",
    "track_mode": "{track_mode}",
    "total_curriculum_days": {total_days},
    "curriculum_overview_summary": "Summary of what this curriculum covers based on source evidence",
    "learning_objectives": ["objective derived from source evidence"],
    "grammar_focus": ["grammar focus from source evidence"],
    "key_vocabulary": ["key terms from source evidence"],
    "day_wise_syllabus": [
      {{
        "day_number": 1,
        "module_week": "Week X: Topic from source",
        "day_topic": "Day 1: Specific topic from source evidence",
        "grammar_rules_detail": "Detailed grammar explanation grounded in source",
        "video_breakdown_analysis": "Analysis of source materials (only if source evidence supports it, otherwise state 'No video/audio source available')",
        "study_notes_markdown": "### Comprehensive study guide with markdown tables, formulas, and examples from source",
        "vocabulary_bank": [
          {{"word": "source word", "meaning": "meaning", "pronunciation": "IPA", "example_sentence": "contextual sentence"}}
        ],
        "classroom_dialogues": ["Dialogue turn in {language} (Translation)"],
        "pedagogical_instructions": "Teaching advice specific to this content",
        "in_class_exercises": ["Exercise question testing source concept"],
        "exercise_solutions": [
          {{"question": "Q", "answer": "verified answer", "explanation": "linguistic explanation"}}
        ],
        "homework_tasks": ["Homework task relevant to source content"]
      }}
    ],
    "homework_and_practice": ["Practice directive"]
  }},
  "teacher_materials": {{
    "presentation_title": "{plan.lesson_title}",
    "subtitle": "{language} {level} Teaching Materials",
    "slides": [
      {{"slide_number": 1, "slide_title": "Title", "bullet_points": ["Point from source"], "teacher_cue": "Teaching instruction"}}
    ],
    "handout_summary_markdown": "Study guide summary"
  }},
  "student_lsrw": {{
    "listening": {{
      "audio_transcript_passage": "Passage in {language} based on source content",
      "audio_script_dialogue": "Dialogue in {language}",
      "comprehension_questions": [{{"question_number": 1, "question": "Q?", "options": ["A", "B", "C", "D"], "correct_answer": "A", "explanation": "Why"}}]
    }},
    "reading": {{
      "passage_title": "Title",
      "reading_text": "Text in {language} grounded in source",
      "vocabulary_glossary": {{"word": "meaning"}},
      "comprehension_questions": [{{"question_number": 1, "question": "Q?", "options": ["A", "B", "C", "D"], "correct_answer": "A", "explanation": "Why"}}]
    }},
    "speaking": {{
      "situation_prompt": "Scenario from source",
      "roleplay_scenario": "Roleplay in {language}",
      "pronunciation_hints": ["Hint from source evidence"],
      "guiding_questions": ["Question"],
      "sample_dialogue_answer": "Model answer in {language}"
    }},
    "writing": {{
      "task_prompt": "Writing task based on source concepts",
      "word_count_guideline": "50-100 words",
      "guiding_hints": ["Hint"],
      "sample_model_response": "Model response in {language}",
      "evaluation_rubrics": [{{"criteria_name": "Criteria", "weight_percentage": 50, "grading_prompt_instructions": "How to grade"}}]
    }}
  }}
}}

Generate {min(day_count_to_generate, 5)} days in day_wise_syllabus. Each day must have distinct content.
Output ONLY valid JSON. No markdown fences, no preamble."""

    return prompt


# =============================================================================
# LEGACY SYSTEM GENERATION PROMPT (kept for non-session resource generation)
# =============================================================================
SYSTEM_GENERATION_PROMPT = """You are a flexible, expert language-learning content writer, curriculum designer, and dynamic academic material generator.

CRITICAL RULE - USER-INTENT SOVEREIGNTY:
1. The RAW USER PROMPT / INSTRUCTION is your HIGHEST PRIMARY AUTHORITY.
2. You are NOT a rigid masterclass document generator. Do NOT force a predefined 10-heading handbook, campus café dialogue, bowing etiquette, or German Sie/du rules unless the user explicitly requested them.
3. If the user prompt asks for "French alphabets teach me with ques and ans", you MUST generate content teaching French alphabets with questions and answers.
4. If the user asks for a concise translation (e.g., Translate "Good morning" into French), provide ONLY a concise translation ("Bonjour"). Do NOT generate a long masterclass handbook.
5. STRICT CONTEXT PRIORITY:
   User Explicit Request > Specific Request Constraints > Conversation History > Course/Resource Context > Default Options.
6. If the user prompt specifies a target language (e.g., "French"), generate content for THAT target language regardless of any background context defaults.
7. If the user asks for an explanation in another language (e.g., "Explain French numbers 1 to 20 in Tamil"), use Tamil for the explanations and French for the target numbers.

IMPORTANT CONSTRAINTS:
Do NOT generate a UI template.
Do NOT generate database fields or placeholder sections.
Do NOT mechanically fill predefined headings.
Do NOT repeat the topic name unnecessarily.
Do NOT write meta commentary such as "This lesson is designed for..."
Do NOT mention that you are an AI or describe the generation process.
Do NOT output placeholder metadata blocks, database fields, or hardcoded templates.
Generate the actual educational learning material directly in Markdown.

==================================================
ACADEMIC INPUT
==================================================

Raw User Prompt / Instructions:
{additional_requirements}

Target Language: {language}
Course: {course}
Level: {level}
Category: {category}
Skill: {skill}
Topic: {topic}
Learning Objective: {learning_objective}
Resource Type: {resource_type}
Difficulty: {difficulty}
Target Audience: {target_audience}

==================================================
CORE GENERATION RULE
==================================================

Generate actual learning material that answers the user's specific request directly.
The learner should be able to open the generated content and STUDY directly from it.

The output length, structure, and format MUST adapt dynamically to the user request:
- For Q&A requests: Provide clean, structured Questions and Answers.
- For Single-question / Step-by-step requests: Provide exactly what was requested.
- For Vocabulary requests: Provide relevant vocabulary terms with meanings and examples.
- For Dialogue / Speaking requests: Provide natural situational dialogue script.
- For Detailed lesson requests: Provide detailed lesson notes.
- For Translation / Correction requests: Provide direct translation / sentence correction without unnecessary filler.

The content must be:
- Natural, Educational, Accurate, Level-appropriate, Contextual, Practical
- Student-friendly, Grammatically correct, Useful for real learning

Return only the final study material in clean Markdown.
"""
