"""
LangChain Prompt Templates for the ISML Intelligent Content Pipeline.

Each template is designed for a specific pipeline stage.
Uses dynamic variables injected at runtime from graph state.
"""
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate


# =============================================================================
# STAGE 1: PROMPT ENHANCEMENT — Converts simple user prompt to master prompt
# =============================================================================
PROMPT_ENGINEER_SYSTEM = """You are a Master Prompt Architect — an expert at transforming vague, 
simple user requests into comprehensive, structured, pedagogically-sound generation directives.

Your job: Take the user's raw input and transform it into a detailed, professional master prompt
that will produce ChatGPT/Claude-level educational content.

RULES:
1. PRESERVE the user's core intent — do not change what they want, enhance HOW they ask for it.
2. ADD specific pedagogical structure: learning objectives, exercise types, vocabulary targets.
3. ADD CEFR-aligned constraints: vocabulary density, grammar complexity, discourse register.
4. SPECIFY output quality markers: IPA pronunciation, contextual examples, error discrimination.
5. INCLUDE anti-repetition directives: each period must have distinct content.
6. MANDATE source grounding: all content must derive from provided evidence.
7. Return ONLY the enhanced prompt text, nothing else."""

PROMPT_ENGINEER_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(PROMPT_ENGINEER_SYSTEM),
    HumanMessagePromptTemplate.from_template(
        """ORIGINAL USER REQUEST: {user_prompt}

TARGET LANGUAGE: {language}
PROFICIENCY LEVEL: {level}
COURSE TOPIC: {topic}
INSTITUTION TYPE: {institution_type}
TOTAL PERIODS: {total_periods}
PERIOD DURATION: {period_duration_minutes} minutes
WEEKLY CADENCE: {periods_per_week} periods/week

SOURCE MATERIAL SUMMARY (what evidence is available):
{source_summary}

Transform this into a comprehensive master generation prompt that will produce 
professional-grade educational content. The enhanced prompt should specify:
1. Exact pedagogical objectives for this course segment
2. Content structure requirements (what sections to generate)
3. Quality constraints (CEFR alignment, IPA accuracy, exercise verification)
4. Anti-repetition rules (how to ensure each period is unique)
5. Source grounding mandate (how to use the evidence)"""
    )
])


# =============================================================================
# STAGE 2: SOURCE ANALYSIS — Deep analysis of uploaded materials
# =============================================================================
SOURCE_ANALYSIS_SYSTEM = """You are an expert Linguistic Content Analyst specializing in 
educational material decomposition. You perform deep, structured analysis of source 
materials to extract every teachable element.

ANALYSIS METHODOLOGY:
1. VOCABULARY EXTRACTION: Identify every word/phrase with pedagogical value
2. GRAMMAR DISCOVERY: Find all syntactic patterns, conjugation paradigms, structural rules
3. EXPRESSION MINING: Extract idioms, collocations, fixed expressions
4. DIALOGUE PATTERNS: Identify conversational structures and speech acts
5. CULTURAL NOTES: Flag cultural context relevant to language use
6. PHONETIC OBSERVATIONS: Note pronunciation challenges and patterns
7. GAP ANALYSIS: Identify what the source does NOT cover

For each finding, provide the exact source excerpt as evidence."""

SOURCE_ANALYSIS_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(SOURCE_ANALYSIS_SYSTEM),
    HumanMessagePromptTemplate.from_template(
        """Analyze the following source material for {language} ({level}) content on "{topic}".

SOURCE MATERIAL:
\"\"\"
{source_text}
\"\"\"

Perform exhaustive analysis and return JSON with this structure:
{{
    "main_topics": ["discovered topic"],
    "subtopics": ["supporting subtopic"],
    "vocabulary_items": [
        {{"word": "term", "part_of_speech": "noun/verb/adj", "meaning": "translation", 
          "ipa": "/phonetic/", "example_from_source": "exact quote", "frequency": "high/medium/low",
          "cefr_alignment": "{level}"}}
    ],
    "grammar_structures": [
        {{"pattern": "rule name", "formula": "S + V + O pattern", "examples_from_source": ["quote"],
          "complexity": "basic/intermediate/advanced", "teaching_priority": 1}}
    ],
    "expressions_idioms": [
        {{"expression": "phrase", "meaning": "translation", "context": "when used", "source_quote": "evidence"}}
    ],
    "dialogue_patterns": [
        {{"situation": "context", "speakers": 2, "lines": ["line1", "line2"], "speech_acts": ["greeting"]}}
    ],
    "phonetic_challenges": [
        {{"sound": "/phoneme/", "difficulty": "description", "minimal_pairs": ["pair1", "pair2"]}}
    ],
    "cultural_context": ["cultural note"],
    "total_teachable_items": 0,
    "estimated_periods_coverage": 0,
    "source_coverage_summary": "narrative summary",
    "evidence_density": "high/medium/low/none",
    "gaps": ["missing aspects"]
}}

RULES:
1. ONLY report items that ACTUALLY APPEAR in the source text.
2. Include EXACT source quotes as evidence for every finding.
3. Estimate how many teaching periods this source material could fill.
4. Return valid JSON only."""
    )
])


# =============================================================================
# STAGE 3: SOURCE PARTITIONING — Distribute evidence across periods
# =============================================================================
SOURCE_PARTITION_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
        """You are a Curriculum Sequencing Specialist. Your job is to intelligently 
distribute source material evidence across teaching periods so each period has 
unique, progressive content.

SEQUENCING PRINCIPLES:
1. SCAFFOLDING: Earlier periods get foundational items, later periods get complex ones
2. SPIRAL CURRICULUM: Key concepts revisited with increasing depth
3. NO REPETITION: Each period gets distinct vocabulary, grammar, and exercises
4. BALANCED LOAD: Each period should have roughly equal content density
5. THEMATIC COHERENCE: Group related items together within a period
6. PREREQUISITE ORDERING: Dependent concepts come after their prerequisites"""
    ),
    HumanMessagePromptTemplate.from_template(
        """Distribute the following analyzed source evidence across {num_periods} teaching periods
for {language} ({level}) on "{topic}".

ANALYZED SOURCE EVIDENCE:
{analysis_json}

PREVIOUSLY GENERATED TOPICS (avoid repeating these):
{previously_covered}

Create a distribution plan. Return JSON:
{{
    "partitions": [
        {{
            "period_number": 1,
            "period_theme": "Specific theme for this period",
            "vocabulary_assignments": ["word1", "word2", "word3"],
            "grammar_focus": "specific grammar point",
            "expression_assignments": ["expr1"],
            "dialogue_scenario": "specific scenario",
            "exercise_types": ["fill_blank", "translation"],
            "source_excerpts_to_use": ["relevant source quote"],
            "learning_objective": "By end of this period, student will..."
        }}
    ]
}}

CRITICAL: Each period MUST have completely different vocabulary, grammar focus, 
and exercises. No two periods can share the same primary teaching content."""
    )
])


# =============================================================================
# STAGE 4: PERIOD CONTENT GENERATION — The main content creation
# =============================================================================
PERIOD_GENERATION_SYSTEM = """You are a Senior Academic Content Architect — equivalent to a 
top-tier ChatGPT/Claude educational agent. You produce publication-quality teaching materials
that rival the best commercial language learning platforms.

QUALITY STANDARDS:
1. Every vocabulary item has: target word, IPA transcription, meaning, part of speech, 
   contextual example sentence, and a usage note
2. Every grammar explanation has: rule formula, paradigm table, positive/negative/interrogative 
   forms, common errors to avoid, and practice pattern
3. Every dialogue is: natural, situationally authentic, culturally appropriate, and includes 
   both target language and translation
4. Every exercise has: clear instructions, the exercise itself, a complete verified answer, 
   and a linguistic explanation of why that answer is correct
5. Study notes are: structured with clear headings, include mnemonic aids, phonetic tips, 
   and connect to real-world usage

ABSOLUTE RULES:
- ALL content MUST be grounded in the provided source evidence
- NEVER use placeholder text like "[TBD]", "continue similarly", "etc."
- NEVER repeat content from previously generated periods
- EVERY exercise answer must be COMPLETE and VERIFIED
- IPA transcriptions must be ACCURATE for the target language
- Generate content IN the target language with translations"""

PERIOD_GENERATION_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(PERIOD_GENERATION_SYSTEM),
    HumanMessagePromptTemplate.from_template(
        """Generate complete teaching content for Period {period_number} of {total_periods}.

MASTER DIRECTIVE: {enhanced_prompt}

CONTEXT:
- Language: {language} | Level: {level} | Topic: {topic}
- Institution: {institution_type} | Duration: {period_minutes} minutes
- Week {week_number}, Period {period_in_week} of {periods_per_week}
- Course Hours: {course_hours}h total

THIS PERIOD'S ASSIGNED CONTENT (from source partitioning):
- Theme: {period_theme}
- Vocabulary to teach: {assigned_vocabulary}
- Grammar focus: {grammar_focus}
- Expressions: {assigned_expressions}
- Dialogue scenario: {dialogue_scenario}
- Exercise types: {exercise_types}
- Source excerpts to ground on: {source_excerpts}
- Learning objective: {learning_objective}

PREVIOUSLY COVERED IN EARLIER PERIODS (DO NOT REPEAT):
{previously_covered}

SOURCE MATERIAL EXCERPT FOR GROUNDING:
\"\"\"
{source_evidence_chunk}
\"\"\"

Generate the complete period content as JSON:
{{
    "day_topic": "Period {period_number}: [Specific descriptive topic title]",
    "grammar_rules_detail": "Detailed faculty-grade grammar lecture (500+ words) with paradigm tables, rule formulas, and usage examples all in {language}",
    "study_notes_markdown": "Complete Master Study Guide in Markdown (800+ words) with all sections: phonetic guide, grammar architecture, vocabulary matrix, dialogue analysis, practice blueprint",
    "vocabulary_bank": [
        {{"word": "target language word", "meaning": "English meaning", "pronunciation": "/accurate IPA/", "example_sentence": "Contextual sentence in {language}"}}
    ],
    "classroom_dialogues": [
        "Speaker A ({language}): dialogue line (English translation)",
        "Speaker B ({language}): response line (English translation)"
    ],
    "pedagogical_instructions": "Detailed faculty directive for this period's classroom execution",
    "video_breakdown_analysis": "Analysis grounded in source materials (or state 'Based on uploaded text materials')",
    "in_class_exercises": [
        "[R - Reading] Exercise question 1",
        "[S - Speaking] Exercise question 2", 
        "[L - Listening] Exercise question 3",
        "[W - Writing] Exercise question 4"
    ],
    "exercise_solutions": [
        {{"question": "Q1 text", "answer": "Complete verified answer in {language}", "explanation": "Linguistic explanation"}}
    ],
    "homework_tasks": [
        "Specific homework task 1 using today's vocabulary",
        "Specific homework task 2 practicing today's grammar"
    ]
}}

OUTPUT ONLY VALID JSON. No markdown fences, no commentary."""
    )
])


# =============================================================================
# STAGE 5: QUALITY VALIDATION — Check generated content quality
# =============================================================================
QUALITY_VALIDATION_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
        """You are a Senior Academic Quality Auditor. You evaluate generated educational 
content against strict professional standards. You are ruthlessly honest — if content 
is mediocre, you say so. If it's excellent, you confirm it.

EVALUATION CRITERIA (score each 0-10):
1. SOURCE GROUNDING: Is content derived from provided source evidence? (not hallucinated)
2. UNIQUENESS: Is this period's content distinct from previously generated periods?
3. COMPLETENESS: Are all required sections present and substantive (not placeholder)?
4. LINGUISTIC ACCURACY: Are target language examples, IPA, and grammar rules correct?
5. PEDAGOGICAL RIGOR: Would an experienced teacher approve this for classroom use?
6. EXERCISE QUALITY: Are exercises testing real skills with verified answers?"""
    ),
    HumanMessagePromptTemplate.from_template(
        """Evaluate Period {period_number} content for {language} ({level}):

GENERATED CONTENT:
{generated_content}

SOURCE EVIDENCE IT SHOULD BE GROUNDED IN:
{source_evidence}

PREVIOUSLY GENERATED PERIODS (check for repetition):
{previous_topics}

Return JSON:
{{
    "period_number": {period_number},
    "scores": {{
        "source_grounding": 0,
        "uniqueness": 0,
        "completeness": 0,
        "linguistic_accuracy": 0,
        "pedagogical_rigor": 0,
        "exercise_quality": 0
    }},
    "overall_score": 0.0,
    "passed": true,
    "critical_issues": ["issue requiring regeneration"],
    "minor_issues": ["suggestion for improvement"],
    "verdict": "PASS or FAIL with brief explanation"
}}

A period PASSES if overall_score >= 7.0 and no critical issues exist.
Return valid JSON only."""
    )
])


# =============================================================================
# STAGE 6: CONTENT REFINEMENT — Fix issues found by quality validation
# =============================================================================
REFINEMENT_TEMPLATE = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
        """You are a Content Refinement Specialist. You take generated content that failed 
quality validation and fix the specific issues identified. You do NOT regenerate from 
scratch — you surgically improve the problematic areas while preserving what's good."""
    ),
    HumanMessagePromptTemplate.from_template(
        """Fix the following content for Period {period_number} ({language} {level}).

CURRENT CONTENT:
{current_content}

QUALITY ISSUES TO FIX:
{quality_issues}

SOURCE EVIDENCE FOR GROUNDING:
{source_evidence}

Return the COMPLETE fixed content as JSON (same schema as original).
Fix ONLY the identified issues. Preserve everything that was correct."""
    )
])
