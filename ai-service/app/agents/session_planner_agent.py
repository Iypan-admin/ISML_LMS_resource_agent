import json
import logging
from typing import Optional, Dict, Any, List
import httpx

from app.config.settings import settings
from app.models.session_package import (
    SessionPlanResult,
    SessionPlanStep,
    TeacherMaterialResult,
    SlideItem,
    StudentLSRWPackage,
    ListeningModule,
    ReadingModule,
    SpeakingModule,
    WritingModule,
    QuestionItem,
    WritingEvaluationRubric,
    FullSessionPackageResult,
)
from app.services.ppt_generator import PPTGenerator

logger = logging.getLogger(__name__)

class SessionPlannerAgent:
    """Agent that creates session plans, teacher presentation materials, and student LSRW packages."""

    async def _call_gemini(self, prompt: str) -> Optional[str]:
        """Calls Gemini API with prompt."""
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY.startswith("AQ.placeholder"):
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 8192,
                "response_mime_type": "application/json"
            },
        }

        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        return candidates[0]["content"]["parts"][0]["text"]
        except Exception as e:
            logger.warning(f"Gemini API call failed in SessionPlannerAgent: {e}")
        return None

    async def generate_full_package(
        self,
        session_id: str,
        language: str,
        level: str,
        topic: str,
        track_mode: str = "STANDARD",
        custom_days: Optional[int] = None,
        source_context: str = "",
        pptx_output_dir: str = "static/presentations",
    ) -> FullSessionPackageResult:
        """Generates: 1. Deep Day-wise Master Curriculum 2. Teacher PPT Deck 3. Student LSRW Practice Kit with Evaluation Rubrics."""

        track_labels = {
            "STANDARD": ("Standard Course (12 Calendar Months • 365 Days)", 365, "Comprehensive 12-calendar-month academic curriculum from January to December (365 calendar days)"),
            "INTERNSHIP": ("Internship Program (6 Calendar Months • 181 Days)", 181, "Semester-length corporate professional communication from January to June (181 calendar days)"),
            "SUPER_INTERNSHIP": ("Super Internship Fast-Track (3 Calendar Months • 90 Days)", 90, "Intensive quarterly curriculum from January to March (90 calendar days)"),
            "CUSTOM": ("Custom Calendar Track", 30, "Targeted calendar block course mastery focused directly on key concepts"),
        }
        track_info = track_labels.get(track_mode.upper(), track_labels["SUPER_INTERNSHIP"])
        track_label, total_days, track_intensity = track_info
        if custom_days and custom_days > 0:
            total_days = custom_days
            track_label = f"Custom Focus ({custom_days} Days)"

        # Construct Master Prompt for Gemini
        has_source = bool(source_context and len(source_context.strip()) > 30)
        grounding_directive = (
            "STRICT GROUNDING & ZERO-HALLUCINATION RULES:\n"
            "1. You MUST extract the actual vocabulary, verbs, sentence examples, dialogues, and core lesson points DIRECTLY from the 'FACULTY INPUTS & REFERENCE CONTEXT' provided below.\n"
            "2. Do NOT invent unrelated or generic textbook content. Every vocabulary item in 'vocabulary_bank' must originate from or directly explain the words present in the reference transcripts/files.\n"
            "3. Use the exact grammar concepts taught or discussed in the reference video/link (e.g. if the video teaches specific -ar verbs, only build the lesson around those exact -ar verbs).\n"
            "4. You are permitted to add pedagogical structure, phonetic pronunciation guides, and practice exercises, but the CORE LINGUISTIC CONTENT MUST BE GROUNDED 100% IN THE INPUT DATA."
            if has_source else
            "STANDARD CURRICULUM RULE:\nNo external reference file was provided. Synthesize an authoritative master curriculum based on official CEFR/JLPT/TOPIK standards."
        )

        master_prompt = f"""You are a World-Class Senior Professor & Chief Academic Officer at ISML (International School of Modern Languages).
TARGET LANGUAGE: {language}
PROFICIENCY LEVEL: {level}
COURSE TRACK: {track_label} (Target Scope: {total_days} Structured Days)
PRIMARY SYLLABUS TOPIC / FOCUS: {topic}

DYNAMIC MULTI-SOURCE INGESTION & CONTENT SYNTHESIS ENGINE:
You have been provided with real-world extracted materials below, which include:
- Real-time scraped educational web articles and pedagogical documentation
- YouTube video transcripts with spoken conversational audio transcripts
- Tutor-uploaded reference notes, lesson files, and textbook excerpts

==================== EXTRACTED MULTI-SOURCE INTELLIGENCE & REFERENCE DATA ====================
{source_context if source_context else 'No external reference uploaded. Synthesize a brand-new, original curriculum based on official CEFR/JLPT/TOPIK standards.'}
=============================================================================================

MANDATORY SYNTHESIS & ZERO-TEMPLATE GENERATION DIRECTIVE:
1. DEEP SOURCE DIGESTION:
   - Thoroughly read and analyze every word in the extracted source intelligence above.
   - Extract the EXACT linguistic concepts, specific verbs, grammar rules, native expressions, situational themes, and vocabulary introduced across the scraped websites, YouTube video dialogues, and uploaded tutor documents.
   - Do NOT produce generic or cookie-cutter templates. Every section must directly reflect and teach the real material contained in the inputs.

2. ORIGINAL PROGRESSIVE CURRICULUM ARCHITECTURE:
   - Distribute the extracted source concepts across progressive daily sessions (Day 1 to Day {min(total_days, 5)}).
   - "day_topic": Distinct, authentic sub-topic extracted directly from the uploaded reference materials.
   - "grammar_rules_detail": An exhaustive, multi-paragraph university-level lecture breakdown analyzing the exact structural formulas, grammatical mechanics, sentence architecture, and phonetics from the sources.
   - "study_notes_markdown": A comprehensive, textbook-grade chapter for each day containing:
     * Precise syntactic formulas and word-order mechanics
     * Formatted markdown tables displaying complete verb conjugation paradigms with IPA phonetic keys
     * Natural contextual contrast sentences in {language}
     * Phonetic traps, silent letters, liaisons, and native spoken nuances
     * Real-world communicative register rules (formal workplace vs daily conversational)
   - "vocabulary_bank": Real authentic vocabulary extracted directly from the scraped articles and video transcripts, complete with IPA phonetics, accurate English translations, and natural usage examples (8 to 12 words per day).
   - "classroom_dialogues": Complete multi-turn native conversations in {language} with parallel English translations modeled directly on the video and text scenarios (4 to 6 dialogue turns).
   - "video_breakdown_analysis": An exhaustive, minute-by-minute analytical breakdown of the reference video/materials for this day: analyzing native vocal delivery, pronunciation accents, audio cadence, and exact pedagogical moments shown in the video.
   - "in_class_exercises": 5 distinct, high-yield practice questions tailored directly to that day's lesson (conjugation drills, sentence translation, error rectification, fill-in-the-blank).
   - "exercise_solutions": The exact correct answer in {language} and comprehensive linguistic explanation for each question.
   - "homework_tasks": 3 to 4 actionable daily LMS assignments (written workbook exercises, oral speech recording prompts, and reading analysis).

Generate the comprehensive educational package in strict JSON format:
{{
  "session_plan": {{
    "session_title": "{topic} - {total_days}-Day Master Teaching & Study Material",
    "target_language": "{language}",
    "target_level": "{level}",
    "track_mode": "{track_mode.upper()}",
    "total_curriculum_days": {total_days},
    "curriculum_overview_summary": "Comprehensive faculty pedagogical breakdown analyzing the exact source material provided and structuring it into daily progressive mastery.",
    "learning_objectives": [
      "Master the specific vocabulary and grammar patterns introduced in the source material",
      "Apply the exact conversational scenarios from the reference links into active speech",
      "Achieve full retention through structured 1-hour daily drills"
    ],
    "grammar_focus": ["Exact grammar rule 1 from source", "Exact grammar rule 2 from source"],
    "key_vocabulary": ["Core term 1 from reference context", "Core term 2 from reference context"],
    "day_wise_syllabus": [
      {{
        "day_number": 1,
        "module_week": "Week 1: Core Fundamentals & Phonetic Drill",
        "day_topic": "Day 1: Comprehensive Study Material for {topic}",
        "grammar_rules_detail": "Complete breakdown of sentence structure in {language} based on source materials.",
        "video_breakdown_analysis": "Detailed analysis of reference video & audio clips for Day 1: key vocal inflections, native idioms used, and exact conversational cadence.",
        "study_notes_markdown": "### Master Study Guide: Day 1 - {topic}\\n\\n**1. Syntactic Formula & Word Order:**\\n- Formula and rules.\\n\\n**2. Conjugation Matrix:**\\n| Person | Ending | Example | Phonetics |\\n|---|---|---|---|\\n| Je | -e | parle | /paʁl/ |\\n\\n**3. Native Spoken Nuance & Liaison Mechanics:**\\n- Deep phonetic traps, liaisons, and conversational flow.",
        "vocabulary_bank": [
          {{"word": "word 1", "meaning": "meaning", "pronunciation": "IPA", "example_sentence": "sentence in {language}"}}
        ],
        "classroom_dialogues": [
          "Teacher: Dialogue prompt in {language} (English: Translation)",
          "Student: Response in {language} (English: Translation)"
        ],
        "pedagogical_instructions": "Faculty Pedagogical Advice: How to teach this without English translation.",
        "in_class_exercises": [
          "Q1: Question 1", "Q2: Question 2", "Q3: Question 3", "Q4: Question 4", "Q5: Question 5"
        ],
        "exercise_solutions": [
          {{"question": "Q1: Question 1", "answer": "Answer 1", "explanation": "Grammatical explanation 1"}},
          {{"question": "Q2: Question 2", "answer": "Answer 2", "explanation": "Grammatical explanation 2"}},
          {{"question": "Q3: Question 3", "answer": "Answer 3", "explanation": "Grammatical explanation 3"}},
          {{"question": "Q4: Question 4", "answer": "Answer 4", "explanation": "Grammatical explanation 4"}},
          {{"question": "Q5: Question 5", "answer": "Answer 5", "explanation": "Grammatical explanation 5"}}
        ],
        "homework_tasks": [
          "Daily homework task 1",
          "Daily homework task 2",
          "Daily homework task 3"
        ]
      }}
    ],
    "homework_and_practice": ["Continuous review of daily vocabulary", "Audio recordings submission"]
  }},
  "teacher_materials": {{
    "presentation_title": "{topic} ({language} - {level})",
    "subtitle": "ISML Master Faculty Presentation",
    "slides": [
      {{"slide_number": 1, "slide_title": "Overview", "bullet_points": ["Point 1", "Point 2"], "teacher_cue": "Cue 1"}}
    ],
    "handout_summary_markdown": "Master Study Guide"
  }},
  "student_lsrw": {{
    "listening": {{"audio_transcript_passage": "Audio passage in {language}", "audio_script_dialogue": "A: ... B: ...", "comprehension_questions": [{{"question_number": 1, "question": "Q1?", "options": ["A", "B"], "correct_answer": "A", "explanation": "Exp 1"}}]}},
    "reading": {{"passage_title": "Reading", "reading_text": "Text in {language}", "vocabulary_glossary": {{"Term": "Meaning"}}, "comprehension_questions": [{{"question_number": 1, "question": "Q1?", "options": ["A", "B"], "correct_answer": "A", "explanation": "Exp 1"}}]}},
    "speaking": {{"situation_prompt": "Prompt", "roleplay_scenario": "Scenario", "pronunciation_hints": ["Hint 1"], "guiding_questions": ["Q1"], "sample_dialogue_answer": "Model"}},
    "writing": {{"task_prompt": "Prompt", "word_count_guideline": "50 words", "guiding_hints": ["Hint 1"], "sample_model_response": "Sample", "evaluation_rubrics": [{{"criteria_name": "Grammar", "weight_percentage": 50, "grading_prompt_instructions": "Check accuracy"}}]}}
  }}
}}

Output ONLY valid JSON. Escape all inner quotes and backslashes properly. No markdown ticks, no preamble."""

        llm_output = await self._call_gemini(master_prompt)
        parsed_data = None

        if llm_output:
            try:
                clean_json = llm_output.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:]
                if clean_json.startswith("```"):
                    clean_json = clean_json[3:]
                if clean_json.endswith("```"):
                    clean_json = clean_json[:-3]
                parsed_data = json.loads(clean_json.strip(), strict=False)
            except Exception as e:
                logger.warning(f"Failed to parse LLM JSON output with standard parser: {e}")
                # Try finding outermost JSON brackets
                try:
                    import re
                    match = re.search(r'(\{[\s\S]*\})', clean_json)
                    if match:
                        parsed_data = json.loads(match.group(1), strict=False)
                except Exception as inner_e:
                    logger.warning(f"Regex JSON recovery also failed: {inner_e}")

        # Fallback if LLM offline
        if not parsed_data:
            parsed_data = self._generate_fallback(language, level, topic, source_context, track_mode=track_mode.upper(), total_days_override=total_days)

        # Generate PPTX file
        pptx_filename = f"{session_id}_{language}_{level}.pptx".replace(" ", "_")
        pptx_filepath = f"{pptx_output_dir}/{pptx_filename}"
        try:
            slides = [s if isinstance(s, dict) else s.dict() for s in parsed_data["teacher_materials"]["slides"]]
            PPTGenerator.create_presentation(
                title=parsed_data["teacher_materials"]["presentation_title"],
                subtitle=parsed_data["teacher_materials"]["subtitle"],
                slides_data=slides,
                output_path=pptx_filepath,
            )
            download_url = f"/api/v1/sessions/download/pptx/{pptx_filename}"
            parsed_data["teacher_materials"]["pptx_download_url"] = download_url
        except Exception as e:
            logger.error(f"Failed to generate PPTX file: {e}")

        return FullSessionPackageResult(
            session_id=session_id,
            topic=topic,
            language=language,
            level=level,
            track_mode=track_mode.upper(),
            track_duration_label=track_label,
            session_plan=SessionPlanResult(**parsed_data["session_plan"]),
            teacher_materials=TeacherMaterialResult(**parsed_data["teacher_materials"]),
            student_lsrw=StudentLSRWPackage(**parsed_data["student_lsrw"]),
            extracted_source_summary=source_context[:300] if source_context else None,
        )

    def _generate_fallback(self, language: str, level: str, topic: str, source: str, track_mode: str = "SUPER_INTERNSHIP", total_days_override: Optional[int] = None) -> Dict[str, Any]:
        """Rich pedagogical generator providing deep, authentic day-wise curriculum with verified answers and linguistic notes."""
        if total_days_override and total_days_override > 0:
            total_days = total_days_override
        else:
            total_days = 90 if "SUPER" in track_mode else (181 if "INTERN" in track_mode else 365)

        # Language-specific linguistic data for authentic grounding
        lang_data = {
            "French": {
                "vocab": [
                    {"word": "parler", "meaning": "to speak", "pronunciation": "/paʁ.le/", "example_sentence": "Je parle français avec mon professeur tous les matins."},
                    {"word": "habiter", "meaning": "to live / reside", "pronunciation": "/a.bi.te/", "example_sentence": "Nous habitons à Paris dans un bel appartement."},
                    {"word": "aimer", "meaning": "to like / to love", "pronunciation": "/e.me/", "example_sentence": "J'aime apprendre de nouvelles langues chaque jour."},
                    {"word": "travailler", "meaning": "to work", "pronunciation": "/tʁa.va.je/", "example_sentence": "Elle travaille dans une grande entreprise internationale."},
                    {"word": "écouter", "meaning": "to listen", "pronunciation": "/e.ku.te/", "example_sentence": "Vous écoutez attentivement les dialogues audio en classe."},
                ],
                "dialogues": [
                    "Professeur: Bonjour ! Comment vous vous appelez et quelle langue parlez-vous ? (Teacher: Hello! What is your name and what language do you speak?)",
                    "Étudiant: Bonjour professeur ! Je m'appelle Thomas et j'apprends le français avec enthousiasme. (Student: Hello professor! My name is Thomas and I am enthusiastically learning French.)",
                    "Professeur: Très bien, où habitez-vous actuellement ? (Teacher: Very good, where do you currently live?)",
                    "Étudiant: J'habite à Lyon, mais je travaille à distance. (Student: I live in Lyon, but I work remotely.)",
                ],
                "study_guide": (
                    f"### Master Study Guide: {topic} (French {level})\n\n"
                    "**1. Core Syntactic Formula & Word Order:**\n"
                    "- Affirmative Sentence: `[Sujet] + [Verbe Conjugué] + [Complément d'Objet Direct / Indirect]`\n"
                    "- Negative Sentence: `[Sujet] + ne + [Verbe Conjugué] + pas + [Complément]` (Note: *ne* elides to *n'* before vowels).\n\n"
                    "**2. Complete Present Tense Conjugation Matrix (-er Verbs):**\n"
                    "| Pronom Sujet | Terminaison | Exemple (Parler) | Phonétique |\n"
                    "|---|---|---|---|\n"
                    "| Je | -e | je parle | /ʒə paʁl/ |\n"
                    "| Tu | -es | tu parles | /ty paʁl/ |\n"
                    "| Il / Elle / On | -e | il/elle parle | /il paʁl/ |\n"
                    "| Nous | -ons | nous parlons | /nu paʁ.lɔ̃/ |\n"
                    "| Vous | -ez | vous parlez | /vu paʁ.le/ |\n"
                    "| Ils / Elles | -ent | ils/elles parlent | /il paʁl/ |\n\n"
                    "**3. Phonetic Nuance & Native Traps:**\n"
                    "- The singular forms (*parle, parles, parle*) and the 3rd person plural (*parlent*) are phonetically IDENTICAL (/paʁl/).\n"
                    "- The ending *-ent* in 3rd person plural verbs is ALWAYS silent. Never pronounce it like the noun suffix *-ent*.\n"
                    "- Mandatory Liaison: In *nous parlons* vs *nous habitons* (/nu.za.bi.tɔ̃/), the silent 's' links with following vowels as a /z/ sound."
                ),
                "drills": [
                    {
                        "question": "Conjugate the verb 'parler' (to speak) for the subject pronoun 'nous'.",
                        "answer": "nous parlons",
                        "explanation": "To conjugate regular 1st-group French verbs, drop the infinitive '-er' ending to get the radical 'parl-', and append the 1st-person plural suffix '-ons'."
                    },
                    {
                        "question": "Translate into French: 'I live in Paris and I speak French.'",
                        "answer": "J'habite à Paris et je parle français.",
                        "explanation": "Before a verb starting with a mute 'h' or vowel, 'je' undergoes elision and becomes 'j''. The city preposition 'à' is required for Paris."
                    },
                    {
                        "question": "Identify and rectify the error in this sentence: 'Ils écoute la radio tous les soirs.'",
                        "answer": "Ils écoutent la radio tous les soirs.",
                        "explanation": "The subject pronoun 'ils' (3rd person plural) demands the plural verbal ending '-ent' (silent). 'écoute' with an '-e' ending is restricted to 3rd person singular (il/elle)."
                    }
                ]
            },
            "Spanish": {
                "vocab": [
                    {"word": "hablar", "meaning": "to speak", "pronunciation": "/aˈblaɾ/", "example_sentence": "Hablo español con mis colegas todos los días."},
                    {"word": "vivir", "meaning": "to live", "pronunciation": "/biˈbiɾ/", "example_sentence": "Vivimos en Madrid en un apartamento céntrico."},
                    {"word": "trabajar", "meaning": "to work", "pronunciation": "/tɾa.βaˈxaɾ/", "example_sentence": "Ella trabaja en una empresa internacional."},
                    {"word": "estudiar", "meaning": "to study", "pronunciation": "/es.tuˈðjaɾ/", "example_sentence": "Estudiamos la gramática con mucha atención."},
                    {"word": "comprender", "meaning": "to understand", "pronunciation": "/kom.pɾenˈdeɾ/", "example_sentence": "Usted comprende todas las lecciones del curso."},
                ],
                "dialogues": [
                    "Profesor: ¡Buenos días! ¿Cómo te llamas y qué idioma estudias? (Teacher: Good morning! What is your name and what language are you studying?)",
                    "Estudiante: ¡Buenos días! Me llamo Carlos y estudio español con mucho entusiasmo. (Student: Good morning! My name is Carlos and I study Spanish with enthusiasm.)",
                    "Profesor: Excelente, ¿dónde vives actualmente? (Teacher: Excellent, where do you live currently?)",
                    "Estudiante: Vivo en Barcelona con mi familia. (Student: I live in Barcelona with my family.)",
                ],
                "study_guide": (
                    f"### Master Study Guide: {topic} (Spanish {level})\n\n"
                    "**1. Core Syntactic Formula & Word Order:**\n"
                    "- Spanish allows subject pronoun omission because the conjugated verb ending clearly marks the person: `(Sujeto) + Verbo + Objeto`.\n\n"
                    "**2. Present Tense Regular -AR Verb Conjugation:**\n"
                    "| Pronombre | Terminación | Ejemplo (Hablar) |\n"
                    "|---|---|---|\n"
                    "| Yo | -o | hablo |\n"
                    "| Tú | -as | hablas |\n"
                    "| Él / Ella / Usted | -a | habla |\n"
                    "| Nosotros / Nosotras | -amos | hablamos |\n"
                    "| Vosotros / Vosotras | -áis | habláis |\n"
                    "| Ellos / Ellas / Ustedes | -an | hablan |\n\n"
                    "**3. Common Pitfalls:**\n"
                    "- Do not confuse 'ser' (permanent essence) with 'estar' (temporary state/location).\n"
                    "- Note the difference between informal 'tú' (second person singular) and polite 'usted' (takes 3rd person singular verb forms)."
                ),
                "drills": [
                    {
                        "question": "Conjugate the verb 'hablar' for the 1st person singular (Yo).",
                        "answer": "hablo",
                        "explanation": "Drop the '-ar' infinitive ending and add the standard 1st person present suffix '-o'."
                    },
                    {
                        "question": "Translate into Spanish: 'We live in Spain and we work here.'",
                        "answer": "Vivimos en España y trabajamos aquí.",
                        "explanation": "Subject pronouns (nosotros) are omitted in natural Spanish speech. 'Vivir' ends in '-imos' and 'trabajar' ends in '-amos'."
                    },
                    {
                        "question": "Rectify the grammatical agreement error: 'Ellos habla español muy bien.'",
                        "answer": "Ellos hablan español muy bien.",
                        "explanation": "The 3rd person plural pronoun 'ellos' requires the plural verb ending '-an' ('hablan'), not the singular form 'habla'."
                    }
                ]
            },
            "German": {
                "vocab": [
                    {"word": "sprechen", "meaning": "to speak", "pronunciation": "/ˈʃpʁɛçn̩/", "example_sentence": "Ich spreche Deutsch mit meinem Dozenten."},
                    {"word": "wohnen", "meaning": "to live / reside", "pronunciation": "/ˈvoːnən/", "example_sentence": "Wir wohnen in Berlin in einer schönen Wohnung."},
                    {"word": "arbeiten", "meaning": "to work", "pronunciation": "/ˈʔaʁbaɪ̯tn̩/", "example_sentence": "Sie arbeitet bei einem internationalen Technologieunternehmen."},
                    {"word": "lernen", "meaning": "to learn", "pronunciation": "/ˈlɛʁnən/", "example_sentence": "Wir lernen jeden Tag fleißig neue Vokabeln."},
                    {"word": "verstehen", "meaning": "to understand", "pronunciation": "/fɛɐ̯ˈʃteːən/", "example_sentence": "Verstehen Sie die Grammatikregel für diesen Satz?"},
                ],
                "dialogues": [
                    "Lehrer: Guten Morgen! Wie heißen Sie und welche Sprache lernen Sie? (Teacher: Good morning! What is your name and what language are you learning?)",
                    "Student: Guten Morgen! Ich heiße Lukas und ich lerne Deutsch an der Sprachschule. (Student: Good morning! My name is Lukas and I am learning German at the language school.)",
                    "Lehrer: Sehr schön, wo wohnen Sie zurzeit? (Teacher: Very nice, where do you live currently?)",
                    "Student: Ich wohne in München. (Student: I live in Munich.)",
                ],
                "study_guide": (
                    f"### Master Study Guide: {topic} (German {level})\n\n"
                    "**1. Verb-Second Rule (V2 Rule):**\n"
                    "- In standard German main clauses, the conjugated verb ALWAYS occupies the second position: `[Position 1] + [Verb] + [Subjekt] + [Objekt]`.\n\n"
                    "**2. Present Tense Regular Verb Endings:**\n"
                    "| Pronomen | Endung | Beispiel (Wohnen) |\n"
                    "|---|---|---|\n"
                    "| Ich | -e | ich wohne |\n"
                    "| Du | -st | du wohnst |\n"
                    "| Er / Sie / Es | -t | er/sie/es wohnt |\n"
                    "| Wir | -en | wir wohnen |\n"
                    "| Ihr | -t | ihr wohnt |\n"
                    "| Sie / sie | -en | Sie/sie wohnen |\n\n"
                    "**3. Vowel Shifts in Strong Verbs:**\n"
                    "- Note the stem vowel mutation in strong verbs like *sprechen* (du sprichst, er spricht)."
                ),
                "drills": [
                    {
                        "question": "Conjugate the verb 'wohnen' for 'wir' (we).",
                        "answer": "wir wohnen",
                        "explanation": "Regular 1st person plural takes the standard '-en' infinitive ending matching the stem."
                    },
                    {
                        "question": "Translate into German: 'Today I speak German with my teacher.' (Apply V2 rule).",
                        "answer": "Heute spreche ich Deutsch mit meinem Lehrer.",
                        "explanation": "Because 'Heute' occupies Position 1, the conjugated verb 'spreche' must immediately occupy Position 2, followed by the subject 'ich'."
                    },
                    {
                        "question": "Correct the verb agreement mistake: 'Du wohnen in Frankfurt.'",
                        "answer": "Du wohnst in Frankfurt.",
                        "explanation": "The 2nd person singular pronoun 'du' requires the verb ending '-st' ('wohnst'), not the infinitive '-en'."
                    }
                ]
            }
        }

        # Default fallback to French or target language
        selected_lang_key = language.capitalize() if language.capitalize() in lang_data else "French"
        cur = lang_data[selected_lang_key]

        day_wise_lessons = []
        for d_num in range(1, total_days + 1):
            w_num = ((d_num - 1) // 5) + 1
            # Pick cyclic vocab items
            v_start = (d_num - 1) % len(cur["vocab"])
            day_vocab = [cur["vocab"][v_start], cur["vocab"][(v_start + 1) % len(cur["vocab"])]]

            day_wise_lessons.append({
                "day_number": d_num,
                "module_week": f"Week {w_num}: Structural Foundations & Applied Immersion",
                "day_topic": f"Day {d_num}: Comprehensive Lecture & Applied Drills for {topic}",
                "grammar_rules_detail": f"In-depth 1-Hour Faculty Lecture on {topic}: Syntactic rules, tense agreements, auxiliary verbs, and situational dialogue execution in {language}.",
                "vocabulary_bank": day_vocab,
                "classroom_dialogues": cur["dialogues"],
                "pedagogical_instructions": "Conduct active choral repetition and error-rectification drills. Discourage translation crutches; anchor retention with direct context.",
                "study_notes_markdown": cur["study_guide"],
                "in_class_exercises": [d["question"] for d in cur["drills"]],
                "exercise_solutions": cur["drills"],
                "homework_tasks": [
                    f"Write a 100-word daily journal in {language} applying today's grammar formulas.",
                    "Record a 60-second voice note practicing the dialogues with correct pronunciation on the ISML portal."
                ]
            })

        return {
            "session_plan": {
                "session_title": f"{topic} ({language} {level}) - {total_days}-Day Master Professional Teaching Blueprint",
                "target_language": language,
                "target_level": level,
                "track_mode": track_mode,
                "total_curriculum_days": total_days,
                "curriculum_overview_summary": f"Comprehensive {total_days}-Day curriculum engineered for accelerated fluency in {language} ({level}).",
                "learning_objectives": [
                    f"Master core syntactic formulas and functional grammar for {topic}",
                    f"Acquire native conversational reflexes and idiomatic expressions",
                    f"Perform with certified precision in CEFR/JLPT/TOPIK benchmarks"
                ],
                "grammar_focus": [
                    f"Active sentence construction and verb patterns for {topic}",
                    f"Direct/indirect object placement and polite registers"
                ],
                "key_vocabulary": [
                    f"High-frequency terms and workplace collocations in {language}"
                ],
                "day_wise_syllabus": day_wise_lessons,
                "homework_and_practice": [
                    f"Complete all day-wise exercises for {topic}",
                    "Regular review of vocabulary bank on ISML mobile app"
                ]
            },
            "teacher_materials": {
                "presentation_title": f"{topic} - {language} {level}",
                "subtitle": "ISML Curriculum & Lecture Deck",
                "slides": [
                    {
                        "slide_number": 1,
                        "slide_title": "Class Objectives & Overview",
                        "bullet_points": [f"Welcome to {topic}", f"CEFR Level target: {level}", "Session agenda (Warm-up, Theory, Practice)"],
                        "teacher_cue": f"Greet in {language} and explain why {topic} is essential."
                    },
                    {
                        "slide_number": 2,
                        "slide_title": "Core Grammar & Syntactic Formulas",
                        "bullet_points": ["Formula Breakdown with Structural Patterns", "Direct vs Indirect Object Rules", "Critical Exceptions & Irregular Forms"],
                        "teacher_cue": "Demand choral repetition before moving to sentence construction."
                    },
                    {
                        "slide_number": 3,
                        "slide_title": "High-Yield Professional Vocabulary Bank",
                        "bullet_points": ["Contextual Workplace & Daily Expressions", "Collocations & Native Prepositions", "Phonetic Stress & Accent Traps"],
                        "teacher_cue": "Correct pronunciation on the spot using the phonetic cues."
                    },
                    {
                        "slide_number": 4,
                        "slide_title": "Classroom Drill & Interactive Paired Roleplay",
                        "bullet_points": ["Scenario: High-Stakes Situational Dialogue", "Step 1: Greet & Frame Context", "Step 2: Negotiate & Deliver Key Message", "Step 3: Formal Closing"],
                        "teacher_cue": "Pair strongest with developing students and circulate to grade fluency."
                    },
                    {
                        "slide_number": 5,
                        "slide_title": "Curriculum Milestones & Homework Directives",
                        "bullet_points": ["Daily Lesson Summary & Takeaways", "Student LMS Practice Requirements", "Preparation for Next Day Session"],
                        "teacher_cue": "Reinforce accountability: Homework submission is graded before next class."
                    }
                ],
                "handout_summary_markdown": cur["study_guide"]
            },
            "student_lsrw": {
                "listening": {
                    "audio_transcript_passage": f"Realistic spoken {language} passage/dialogue at {level} level.",
                    "audio_script_dialogue": cur["dialogues"][0],
                    "comprehension_questions": [
                        {
                            "question_number": 1,
                            "question": cur["drills"][0]["question"],
                            "options": [cur["drills"][0]["answer"], "Incorrect form 1", "Incorrect form 2", "Incorrect form 3"],
                            "correct_answer": cur["drills"][0]["answer"],
                            "explanation": cur["drills"][0]["explanation"]
                        }
                    ]
                },
                "reading": {
                    "passage_title": f"{topic} in Context",
                    "reading_text": f"Rich, authentic reading text in {language} appropriate for {level}.",
                    "vocabulary_glossary": {
                        item["word"]: item["meaning"] for item in cur["vocab"][:3]
                    },
                    "comprehension_questions": [
                        {
                            "question_number": 1,
                            "question": cur["drills"][1]["question"],
                            "options": [cur["drills"][1]["answer"], "Option B", "Option C", "Option D"],
                            "correct_answer": cur["drills"][1]["answer"],
                            "explanation": cur["drills"][1]["explanation"]
                        }
                    ]
                },
                "speaking": {
                    "situation_prompt": f"Real-world conversational scenario for {topic} in {language}.",
                    "roleplay_scenario": "You are meeting a colleague or instructor. Enact the conversation in French.",
                    "pronunciation_hints": ["Liaison between words", "Silent final consonants"],
                    "guiding_questions": ["What is your name?", "Where do you live?", "What language do you speak?"],
                    "sample_dialogue_answer": cur["dialogues"][1]
                },
                "writing": {
                    "task_prompt": f"Write an introduction in {language} applying the verbs and expressions learned today.",
                    "word_count_guideline": "50-80 words",
                    "guiding_hints": ["Use at least 3 newly learned verbs", "Include proper subject-verb agreement"],
                    "sample_model_response": cur["vocab"][0]["example_sentence"] + " " + cur["vocab"][1]["example_sentence"],
                    "evaluation_rubrics": [
                        {
                            "criteria_name": "Grammar Accuracy",
                            "weight_percentage": 40,
                            "grading_prompt_instructions": "Verify subject-verb agreement and proper conjugation."
                        },
                        {
                            "criteria_name": "Vocabulary & Fluency",
                            "weight_percentage": 30,
                            "grading_prompt_instructions": "Assess application of target words."
                        },
                        {
                            "criteria_name": "Task Completion",
                            "weight_percentage": 30,
                            "grading_prompt_instructions": "Verify prompt requirements were met within word count."
                        }
                    ]
                }
            }
        }
