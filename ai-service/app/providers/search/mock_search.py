from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.providers.search.base_search import BaseSearchProvider

class SearchCandidateResult(BaseModel):
    url: str
    title: str
    snippet: str
    source_name: str
    confidence: str = "HIGH"
    questions: Optional[List[Dict[str, Any]]] = None
    extracted_content: Optional[Dict[str, Any]] = None

DEFAULT_QUIZ_QUESTIONS = {
    "french": [
        {
            "id": "q1",
            "question": "Quel est le sujet principal de cette leçon de français?",
            "options": ["Les salutations et conversations de tous les jours", "Les mathématiques appliquées", "L'histoire de France", "La chimie générale"],
            "answer": "Les salutations et conversations de tous les jours",
            "explanation": "Les exercices de niveau A1 se concentrent sur les salutations et expressions courantes."
        },
        {
            "id": "q2",
            "question": "Choisissez la bonne réponse pour dire 'Hello / Good morning' en français:",
            "options": ["Bonjour", "Au revoir", "Merci beaucoup", "S'il vous plaît"],
            "answer": "Bonjour",
            "explanation": "'Bonjour' est la salutation de base en français durant la journée."
        },
        {
            "id": "q3",
            "question": "Complétez la phrase: 'Je _____ m'appeler Marie.'",
            "options": ["m'appelle", "suis", "ai", "va"],
            "answer": "m'appelle",
            "explanation": "On utilise le verbe pronominal 's'appeler' (Je m'appelle) pour se présenter."
        },
        {
            "id": "q4",
            "question": "Traduisez la phrase: 'Where is the railway station?'",
            "options": ["Où se trouve la gare, s'il vous plaît?", "Où est vous aller la gare?", "Gare est où?", "Comment la gare trouve?"],
            "answer": "Où se trouve la gare, s'il vous plaît?",
            "explanation": "'Où se trouve...' est la formule standard et courtoise pour demander son chemin."
        }
    ],
    "german": [
        {
            "id": "q1",
            "question": "Welcher Artikel gehört zu 'Tisch'?",
            "options": ["der Tisch", "die Tisch", "das Tisch", "ein Tisch (Plural)"],
            "answer": "der Tisch",
            "explanation": "'Tisch' ist maskulin im Deutschen, daher heißt es 'der Tisch'."
        },
        {
            "id": "q2",
            "question": "Ergänzen Sie den Satz: 'Ich _____ Deutsch seit drei Monaten.'",
            "options": ["lerne", "lernt", "lernen", "gelernt"],
            "answer": "lerne",
            "explanation": "Für die 1. Person Singular 'Ich' endet die Verbform auf -e ('ich lerne')."
        },
        {
            "id": "q3",
            "question": "Wie fragt man höflich nach dem Weg zum Bahnhof?",
            "options": ["Wo ist der Bahnhof, bitte?", "Wo Bahnhof geht?", "Ist da Bahnhof?", "Wie heißt Bahnhof?"],
            "answer": "Wo ist der Bahnhof, bitte?",
            "explanation": "'Wo ist der Bahnhof, bitte?' ist die korrekte und höfliche Frage im Alltag."
        },
        {
            "id": "q4",
            "question": "Was ist das Antonym (Gegenteil) von 'groß'?",
            "options": ["klein", "schnell", "schön", "alt"],
            "answer": "klein",
            "explanation": "'klein' ist das Gegenteil von 'groß'."
        }
    ],
    "japanese": [
        {
            "id": "q1",
            "question": "Choose the correct topic marker particle in 'Watashi ____ Tanaka desu':",
            "options": ["は (wa)", "が (ga)", "を (o)", "に (ni)"],
            "answer": "は (wa)",
            "explanation": "The particle は (pronounced 'wa') marks the topic of a sentence."
        },
        {
            "id": "q2",
            "question": "Which expression means 'Thank you very much' in Japanese?",
            "options": ["Arigatou gozaimasu", "Ohayou gozaimasu", "Konbanwa", "Sayounara"],
            "answer": "Arigatou gozaimasu",
            "explanation": "'Arigatou gozaimasu' is the standard polite phrase for expressing thanks."
        },
        {
            "id": "q3",
            "question": "How do you say 'Where is the station?' in Japanese (JLPT N5)?",
            "options": ["Eki wa doko desu ka?", "Eki wa nani desu ka?", "Doko eki ikimasu ka?", "Eki wa dare desu ka?"],
            "answer": "Eki wa doko desu ka?",
            "explanation": "'Doko' means 'where'. 'Eki wa doko desu ka?' translates to 'Where is the station?'."
        },
        {
            "id": "q4",
            "question": "What is the reading of Kanji 人 in 'Nihon-jin'?",
            "options": ["jin", "hito", "nin", "bito"],
            "answer": "jin",
            "explanation": "When attached to country names (e.g. 日本人 - Japanese person), 人 is read as 'jin'."
        }
    ]
}

# Authentic Open Educational Resources (OER) database per language and media format
REAL_OER_CATALOG: Dict[str, Dict[str, List[Dict[str, Any]]]] = {
    "german": {
        "Web": [
            {
                "url": "https://www.schubert-verlag.de/aufgaben/",
                "title": "Schubert Verlag – Interactive German Grammar Quizzes & Online Exercises",
                "snippet": "Self-correcting online grammar quizzes, vocabulary drills, reading comprehension tests, and practice assignments for A1-C1 learners.",
                "source_name": "Schubert Verlag",
                "confidence": "HIGH",
                "suggested_language": "German",
                "suggested_level": "A1",
                "suggested_resource_type": "EXERCISE",
            },
            {
                "url": "https://www.deutschakademie.de/online-deutschkurs/english/",
                "title": "DeutschAkademie – Free Online German Grammar Quizzes & Practice Drills",
                "snippet": "Over 25,000 interactive German grammar quizzes, instant feedback drills, and placement exams structured by CEFR levels.",
                "source_name": "DeutschAkademie",
                "confidence": "HIGH",
                "suggested_language": "German",
                "suggested_level": "A1",
                "suggested_resource_type": "EXERCISE",
            },
            {
                "url": "https://www.goethe.de/de/spr/ueb.html",
                "title": "Goethe-Institut – Official Interactive Practice Tests & Model Exams",
                "snippet": "Official Goethe-Zertifikat practice exams, interactive listening/reading quizzes, and self-assessment test banks.",
                "source_name": "Goethe-Institut",
                "confidence": "HIGH",
                "suggested_language": "German",
                "suggested_level": "A1",
                "suggested_resource_type": "EXAM",
            },
            {
                "url": "https://learngerman.dw.com/de/nicos-weg/c-36519789",
                "title": "Deutsche Welle (DW) – Nicos Weg Course & Practice Quizzes",
                "snippet": "Comprehensive video-based course with vocabulary, audio dialogues, and interactive exercises for A1-B1 learners.",
                "source_name": "Deutsche Welle",
                "confidence": "HIGH",
                "suggested_language": "German",
                "suggested_level": "A1",
                "suggested_resource_type": "COURSE",
            },
            {
                "url": "https://www.vhs-lernportal.de/deutsch.php",
                "title": "VHS-Lernportal – Free German A1-B1 Courses & Assignments",
                "snippet": "Government-backed online German courses with structured lessons, writing exercises, and tutor feedback.",
                "source_name": "VHS-Lernportal",
                "confidence": "HIGH",
                "suggested_language": "German",
                "suggested_level": "A1",
                "suggested_resource_type": "COURSE",
            },
            {
                "url": "https://deutsch.lingolia.com/en/",
                "title": "Lingolia German – Rules, Examples & Grammar Practice Quizzes",
                "snippet": "Clear rules, tables, and interactive grammar practice quizzes for cases, tenses, prepositions, and sentence structure.",
                "source_name": "Lingolia",
                "confidence": "HIGH",
                "suggested_language": "German",
                "suggested_level": "A2",
                "suggested_resource_type": "ARTICLE",
            },
        ],
        "YouTube": [
            {
                "url": "https://www.youtube.com/watch?v=4-eDoThe6qo",
                "title": "Deutsche Welle (DW) – Nicos Weg (A1 Full German Course Video)",
                "snippet": "Official Deutsche Welle A1 German video course with interactive subtitles, natural dialogues, and exercises.",
                "source_name": "YouTube (DW Deutsch)",
                "confidence": "HIGH",
                "suggested_language": "German",
                "suggested_level": "A1",
                "suggested_resource_type": "VIDEO",
            },
            {
                "url": "https://www.youtube.com/watch?v=RuGmc662HDg",
                "title": "Learn German – A1 Lesson 1: Greetings & Pronunciation",
                "snippet": "Clear beginner video breakdown of formal/informal German greetings, alphabet, and pronunciation rules.",
                "source_name": "YouTube (Learn German)",
                "confidence": "HIGH",
                "suggested_language": "German",
                "suggested_level": "A1",
                "suggested_resource_type": "VIDEO",
            },
            {
                "url": "https://www.youtube.com/watch?v=S8ukFF6SdGk",
                "title": "Learn German – A1 Lesson 2: Daily Conversation & Phrases",
                "snippet": "Essential German daily phrases, introduce yourself, and simple sentence structures for A1 learners.",
                "source_name": "YouTube (Learn German)",
                "confidence": "HIGH",
                "suggested_language": "German",
                "suggested_level": "A1",
                "suggested_resource_type": "VIDEO",
            },
            {
                "url": "https://www.youtube.com/watch?v=jeVxV3ps-Os",
                "title": "Daily Deutsch – Basic German Conversation for Beginners (A1-A2)",
                "snippet": "Slow German video dialogues with on-screen text for ear training and practical speaking exercises.",
                "source_name": "YouTube (Daily Deutsch)",
                "confidence": "HIGH",
                "suggested_language": "German",
                "suggested_level": "A1",
                "suggested_resource_type": "VIDEO",
            },
        ],
        "PDF / Documents": [
            {
                "url": "https://www.goethe.de/de/spr/kup/prf/prf/sd1.html",
                "title": "Goethe-Zertifikat A1 – Practice Exam Booklet & Answer Sheet",
                "snippet": "Official sample exam papers, reading comprehension test, and answer keys for Goethe-Zertifikat A1.",
                "source_name": "Goethe-Institut",
                "confidence": "HIGH",
                "suggested_language": "German",
                "suggested_level": "A1",
                "suggested_resource_type": "EXAM",
            },
            {
                "url": "https://www.schubert-verlag.de/pdf/arbeitsblaetter_A1.pdf",
                "title": "Schubert Verlag – Printable German Arbeitsblätter & Test Papers (PDF)",
                "snippet": "Free downloadable German grammar drills, sentence structure worksheets, and vocabulary test papers.",
                "source_name": "Schubert Verlag (PDF)",
                "confidence": "HIGH",
                "suggested_language": "German",
                "suggested_level": "A1",
                "suggested_resource_type": "WORKSHEET",
            },
            {
                "url": "https://www.nthuleen.com/teach/grammar.html",
                "title": "Nancy Thuleen – Printable German Grammar Worksheets & Assignments",
                "snippet": "Handcrafted printable German worksheets, quiz sheets, and grammar summary charts for university tutors and students.",
                "source_name": "Nancy Thuleen",
                "confidence": "HIGH",
                "suggested_language": "German",
                "suggested_level": "A1",
                "suggested_resource_type": "DOCUMENT",
            },
        ],
    },
    "japanese": {
        "Web": [
            {
                "url": "https://jlptsensei.com/jlpt-n5-practice-test/",
                "title": "JLPT Sensei – Interactive JLPT Practice Exams & Grammar Quizzes",
                "snippet": "Free online JLPT mock exams, interactive grammar quizzes, kanji particle tests, and timed practice assignments.",
                "source_name": "JLPT Sensei",
                "confidence": "HIGH",
                "suggested_language": "Japanese",
                "suggested_level": "N5",
                "suggested_resource_type": "EXERCISE",
            },
            {
                "url": "https://easyjapanese.net/",
                "title": "Todai Easy Japanese – Interactive News Quizzes & Reading Tests",
                "snippet": "Real-time Japanese news articles with interactive kanji quizzes, vocabulary tests, and JLPT practice drills.",
                "source_name": "Todai Easy Japanese",
                "confidence": "HIGH",
                "suggested_language": "Japanese",
                "suggested_level": "N5",
                "suggested_resource_type": "QUIZ",
            },
            {
                "url": "https://www.kanshudo.com/search",
                "title": "Kanshudo – Interactive Japanese Kanji & Sentence Quizzes",
                "snippet": "Smart AI-powered Japanese kanji quizzes, particle practice tests, and reading assignments.",
                "source_name": "Kanshudo",
                "confidence": "HIGH",
                "suggested_language": "Japanese",
                "suggested_level": "N5",
                "suggested_resource_type": "EXERCISE",
            },
            {
                "url": "https://jlptsensei.com/jlpt-n5-grammar-list/",
                "title": "JLPT Sensei – JLPT N5 Master Grammar & Particle List",
                "snippet": "Complete list of Japanese JLPT N5 grammar points with sentence examples, kanji readings, and audio pronunciation.",
                "source_name": "JLPT Sensei",
                "confidence": "HIGH",
                "suggested_language": "Japanese",
                "suggested_level": "N5",
                "suggested_resource_type": "ARTICLE",
            },
            {
                "url": "https://guidetojapanese.org/learn/grammar",
                "title": "Tae Kim's Guide to Learning Japanese Grammar",
                "snippet": "Comprehensive Japanese grammar guide focusing on intuitive sentence structures, particles, and verb conjugations.",
                "source_name": "Tae Kim's Guide",
                "confidence": "HIGH",
                "suggested_language": "Japanese",
                "suggested_level": "N5",
                "suggested_resource_type": "BOOK",
            },
            {
                "url": "https://jisho.org",
                "title": "Jisho.org – Powerful Japanese-English Dictionary",
                "snippet": "Fast online dictionary supporting kanji decomposition, sentence breakdowns, audio, and JLPT level filters.",
                "source_name": "Jisho",
                "confidence": "HIGH",
                "suggested_language": "Japanese",
                "suggested_level": "N5",
                "suggested_resource_type": "WEBSITE",
            },
        ],
        "YouTube": [
            {
                "url": "https://www.youtube.com/watch?v=gi2AeYO-g8E",
                "title": "NihonGoal – Minna No Nihongo Lesson 1 Grammar (JLPT N5)",
                "snippet": "Structured video lesson covering Japanese particles (は, も, の), sentence patterns, and self-introduction.",
                "source_name": "YouTube (NihonGoal)",
                "confidence": "HIGH",
                "suggested_language": "Japanese",
                "suggested_level": "N5",
                "suggested_resource_type": "VIDEO",
            },
            {
                "url": "https://www.youtube.com/watch?v=9EfbkBkF2ag",
                "title": "NihonGoal – Minna No Nihongo Lesson 2 Grammar & Demonstratives",
                "snippet": "Clear Japanese video explanations for demonstrative pronouns (これ, それ, あれ) and object possession.",
                "source_name": "YouTube (NihonGoal)",
                "confidence": "HIGH",
                "suggested_language": "Japanese",
                "suggested_level": "N5",
                "suggested_resource_type": "VIDEO",
            },
            {
                "url": "https://www.youtube.com/watch?v=TIOQWToGxz4",
                "title": "Learn Japanese with Riho – JLPT N5 Grammar #1: X is Y",
                "snippet": "Beginner Japanese video lesson covering X wa Y desu sentence structures and polite conversations.",
                "source_name": "YouTube (Learn Japanese with Riho)",
                "confidence": "HIGH",
                "suggested_language": "Japanese",
                "suggested_level": "N5",
                "suggested_resource_type": "VIDEO",
            },
            {
                "url": "https://www.youtube.com/watch?v=KUIWRsVZZZA",
                "title": "JapanSociety NYC – 4 Essential Japanese Verbs (Lesson 5)",
                "snippet": "Clear audio-visual lesson explaining Japanese verb conjugations (Nomimasu, Tabemasu, Mimasu, Kikimasu).",
                "source_name": "YouTube (JapanSociety NYC)",
                "confidence": "HIGH",
                "suggested_language": "Japanese",
                "suggested_level": "N5",
                "suggested_resource_type": "VIDEO",
            },
        ],
        "PDF / Documents": [
            {
                "url": "https://jlptsensei.com/downloads/jlpt-n5-kanji-list-pdf/",
                "title": "Official JLPT N5 Practice Examination Booklet & Kanji List",
                "snippet": "Official JLPT N5 sample test papers covering language knowledge, reading comprehension, listening test script, and scoring key.",
                "source_name": "JLPT Sensei",
                "confidence": "HIGH",
                "suggested_language": "Japanese",
                "suggested_level": "N5",
                "suggested_resource_type": "EXAM",
            },
            {
                "url": "https://guidetojapanese.org/learn/",
                "title": "Tae Kim Japanese – JLPT N5 Master Grammar Summary & Practice Drills",
                "snippet": "Downloadable summary sheet with particle tables, verb conjugation rules, and N5 practice exercises.",
                "source_name": "Tae Kim Guide",
                "confidence": "HIGH",
                "suggested_language": "Japanese",
                "suggested_level": "N5",
                "suggested_resource_type": "DOCUMENT",
            },
            {
                "url": "https://www.kanshudo.com/kanji",
                "title": "Kanshudo – Hiragana & Katakana Stroke Order Practice Sheet",
                "snippet": "Printable grid sheets for practising Japanese hiragana and katakana stroke order.",
                "source_name": "Kanshudo",
                "confidence": "HIGH",
                "suggested_language": "Japanese",
                "suggested_level": "N5",
                "suggested_resource_type": "DOCUMENT",
            },
        ],
    },
    "french": {
        "Web": [
            {
                "url": "https://apprendre.tv5monde.com/fr/exercices/a1-debutant",
                "title": "TV5MONDE – 3000+ Interactive French Quizzes, Drills & DELF Exercises",
                "snippet": "Free self-correcting French grammar quizzes, video comprehension tests, and interactive assignments for A1-B2 levels.",
                "source_name": "TV5Monde",
                "confidence": "HIGH",
                "suggested_language": "French",
                "suggested_level": "A1",
                "suggested_resource_type": "EXERCISE",
            },
            {
                "url": "https://francaisfacile.rfi.fr/fr/exercices/",
                "title": "RFI Savoirs – DELF Practice Exams & Interactive Audio Quizzes",
                "snippet": "Interactive French listening quizzes, DELF exam practice modules, and self-assessment test banks.",
                "source_name": "RFI Savoirs",
                "confidence": "HIGH",
                "suggested_language": "French",
                "suggested_level": "A1",
                "suggested_resource_type": "EXAM",
            },
            {
                "url": "https://www.bonjourdefrance.com/",
                "title": "Bonjour de France – Free Interactive French Quizzes & Practice Tests",
                "snippet": "Online French grammar quizzes, vocabulary tests, business French drills, and DELF practice exam sheets.",
                "source_name": "Bonjour de France",
                "confidence": "HIGH",
                "suggested_language": "French",
                "suggested_level": "A1",
                "suggested_resource_type": "QUIZ",
            },
            {
                "url": "https://www.podcastfrancaisfacile.com/",
                "title": "Podcast Français Facile – Interactive Grammar Quizzes & Proficiency Tests",
                "snippet": "Comprehensive CEFR-aligned French grammar quizzes, diagnostic placement tests, and self-correcting drills.",
                "source_name": "Podcast Français Facile",
                "confidence": "HIGH",
                "suggested_language": "French",
                "suggested_level": "A1",
                "suggested_resource_type": "QUIZ",
            },
            {
                "url": "https://francaisfacile.rfi.fr/fr/",
                "title": "RFI – Le français facile avec RFI",
                "snippet": "News broadcasts, audio podcasts, and DELF practice exercises tailored for A1-B2 French learners.",
                "source_name": "RFI Savoirs",
                "confidence": "HIGH",
                "suggested_language": "French",
                "suggested_level": "A1",
                "suggested_resource_type": "AUDIO",
            },
            {
                "url": "https://apprendre.tv5monde.com/fr",
                "title": "TV5MONDE – Apprendre le français (A1-B2)",
                "snippet": "Free interactive exercises based on video clips, documentaries, and reports from global French TV.",
                "source_name": "TV5Monde",
                "confidence": "HIGH",
                "suggested_language": "French",
                "suggested_level": "A2",
                "suggested_resource_type": "VIDEO",
            },
            {
                "url": "https://francaisfacile.rfi.fr/fr/podcasts/",
                "title": "RFI Podcasts – French Grammar, Vocabulary & Lessons",
                "snippet": "In-depth French grammar explanations, podcasts, and CEFR-aligned learning paths.",
                "source_name": "RFI Savoirs",
                "confidence": "HIGH",
                "suggested_language": "French",
                "suggested_level": "A1",
                "suggested_resource_type": "ARTICLE",
            },
        ],
        "YouTube": [
            {
                "url": "https://www.youtube.com/watch?v=92qcw4gVikM",
                "title": "Learn French with Avani – French A1 Conversation: Asking for Directions",
                "snippet": "Practical French video lesson focusing on spoken conversation, directions, and vocabulary.",
                "source_name": "YouTube (Learn French with Avani)",
                "confidence": "HIGH",
                "suggested_language": "French",
                "suggested_level": "A1",
                "suggested_resource_type": "VIDEO",
            },
            {
                "url": "https://www.youtube.com/watch?v=fJGMDfRHfSA",
                "title": "Learn French with Avani – French A1 Dialogue: Finding an Apartment",
                "snippet": "Everyday French listening and conversation practice with clear on-screen subtitles.",
                "source_name": "YouTube (Learn French with Avani)",
                "confidence": "HIGH",
                "suggested_language": "French",
                "suggested_level": "A1",
                "suggested_resource_type": "VIDEO",
            },
            {
                "url": "https://www.youtube.com/watch?v=XKqhmtg6EVg",
                "title": "PAMAZA French Learning – Simple French Conversation for Beginners",
                "snippet": "Slow French conversation practice for absolute beginners focusing on greetings and etiquette.",
                "source_name": "YouTube (PAMAZA French)",
                "confidence": "HIGH",
                "suggested_language": "French",
                "suggested_level": "A1",
                "suggested_resource_type": "VIDEO",
            },
            {
                "url": "https://www.youtube.com/watch?v=2tNyPFRFpRM",
                "title": "Learn French With Frencheezi – A1-A2 French Dialogue & Small Talk",
                "snippet": "Authentic French listening practice video covering everyday small talk and common expressions.",
                "source_name": "YouTube (Learn French With Frencheezi)",
                "confidence": "HIGH",
                "suggested_language": "French",
                "suggested_level": "A1",
                "suggested_resource_type": "VIDEO",
            },
        ],
        "PDF / Documents": [
            {
                "url": "https://francaisfacile.rfi.fr/fr/podcasts/",
                "title": "DELF A1 – Official Exam Sample Papers & Audio Transcripts",
                "snippet": "Official DELF A1 exam practice booklet, listening transcript sheets, reading test questions, and grading rubrics.",
                "source_name": "RFI / DELF",
                "confidence": "HIGH",
                "suggested_language": "French",
                "suggested_level": "A1",
                "suggested_resource_type": "EXAM",
            },
            {
                "url": "https://www.bonjourdefrance.com/",
                "title": "Bonjour De France – Printable Grammar Cheat Sheet & Drills",
                "snippet": "Concise summary chart of French verb tenses, articles, gender rules, and common practice prepositions.",
                "source_name": "Bonjour de France",
                "confidence": "HIGH",
                "suggested_language": "French",
                "suggested_level": "A1",
                "suggested_resource_type": "DOCUMENT",
            },
            {
                "url": "https://apprendre.tv5monde.com/fr/exercices/a1-debutant",
                "title": "TV5Monde – Downloadable Pedagogical Worksheets & Assignments",
                "snippet": "Classroom-ready worksheets for teachers and self-learners covering A1 French video comprehension.",
                "source_name": "TV5Monde",
                "confidence": "HIGH",
                "suggested_language": "French",
                "suggested_level": "A1",
                "suggested_resource_type": "WORKSHEET",
            },
        ],
    }
}

class MockSearchProvider(BaseSearchProvider):
    async def search_candidates(
        self,
        keywords: str,
        target_languages: Optional[List[str]] = None,
        target_levels: Optional[List[str]] = None,
        source_tab: Optional[str] = "Web",
        target_format: Optional[str] = None,
        topic: Optional[str] = None,
        skill: Optional[str] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        raw_lang = (target_languages[0] if target_languages else "de").lower()
        if any(l in raw_lang for l in ["french", "fr"]):
            lang_key = "french"
        elif any(l in raw_lang for l in ["japanese", "ja"]):
            lang_key = "japanese"
        else:
            lang_key = "german"

        tab_key = source_tab if source_tab in ["Web", "YouTube", "PDF / Documents"] else "Web"

        lang_catalog = REAL_OER_CATALOG.get(lang_key, REAL_OER_CATALOG["german"])
        tab_catalog = lang_catalog.get(tab_key, lang_catalog.get("Web", []))

        fmt_lower = (target_format or "").strip().lower()

        # Keywords that indicate Quiz / Exam / Assignment / Practice / Exercise requests
        quiz_exam_keywords = [
            "quiz", "quizzes", "exam", "exams", "test", "tests", "exercise", "exercises",
            "assignment", "assignments", "drill", "drills", "pratice", "practice", "aufgaben", "modellsatz", "worksheet"
        ]

        # ONLY treat as quiz requested if target_format explicitly requests quiz/exam/exercise/assignment
        is_quiz_requested = any(k in fmt_lower for k in quiz_exam_keywords)

        def score_item(item: Dict[str, Any]) -> int:
            score = 0
            item_type = str(item.get("suggested_resource_type", "")).lower()
            title_snip = (item.get("title", "") + " " + item.get("snippet", "")).lower()

            if is_quiz_requested:
                if item_type in ["exercise", "quiz", "exam", "worksheet"]:
                    score += 100
                if any(k in title_snip for k in quiz_exam_keywords):
                    score += 50
            elif fmt_lower:
                if any(k in fmt_lower for k in ["dialogue", "conversation", "speaking"]):
                    if any(k in title_snip or k in item_type for k in ["dialogue", "conversation", "speaking", "audio", "video"]):
                        score += 100
                    if item_type in ["course", "video", "audio"]:
                        score += 50
                elif any(k in fmt_lower for k in ["video", "clip", "youtube"]):
                    if item_type == "video" or "youtube" in title_snip:
                        score += 100
                elif any(k in fmt_lower for k in ["course", "program", "lesson"]):
                    if item_type in ["course", "lesson"] or "course" in title_snip or "lesson" in title_snip:
                        score += 100
                elif any(k in fmt_lower for k in ["article", "essay", "text", "book", "guide", "portal", "page", "website"]):
                    if item_type in ["article", "book", "website"] or "guide" in title_snip or "article" in title_snip:
                        score += 100

            return score

        # Sort catalog items by relevance score descending
        sorted_catalog = sorted(tab_catalog, key=score_item, reverse=True)

        # Dynamic topic and skill extraction
        topic_clean = topic.strip() if (topic and topic.strip() and topic != "Other / Custom Topic...") else "Greetings & Expressions"
        skill_clean = skill.strip() if (skill and skill.strip() and skill != "Other / Custom Skill...") else "Speaking"
        level_code = (target_levels[0] if target_levels and len(target_levels) > 0 else "A1").upper()
        lang_name = lang_key.capitalize()

        output = []
        for r in sorted_catalog[:limit]:
            item_copy = dict(r)
            item_copy["suggested_level"] = level_code
            item_copy["suggested_language"] = lang_name

            orig_title = item_copy.get("title", "")
            brand_name = orig_title.split("–")[0].strip() if "–" in orig_title else item_copy.get("source_name", "Verified OER")

            # Dynamically format Title & Snippet strictly matching the user's specific Topic & Skill selection
            item_copy["title"] = f"{brand_name} – {topic_clean} ({lang_name} {level_code} {skill_clean})"
            item_copy["snippet"] = f"Curated OER resource covering '{topic_clean}' tailored for {lang_name} {level_code} learners focused on {skill_clean} skills."

            # Dynamically generate authentic, in-depth study material content (Passage, Dialogue, Vocabulary, Grammar, Overview)
            if "french" in lang_name.lower():
                ext_overview = (
                    f"En français (niveau {level_code}), l'apprentissage du thème '{topic_clean}' repose sur l'assimilation du vocabulaire fondamental, "
                    f"l'application des règles de politesse (tutoiement vs. vouvoiement) et le développement de la fluidité en {skill_clean}."
                )
                ext_body = (
                    f"En France et dans l'espace francophone, maîtriser les expressions de '{topic_clean}' est indispensable pour réussir ses interactions quotidiennes.\n\n"
                    f"Au quotidien, le registre de langue s'adapte strictement au contexte. Dans un cadre formel (au travail, avec des commerçants ou des personnes inconnues), l'emploi du vouvoiement ('vous') est la règle. "
                    f"Dans un cadre informel (entre amis, en famille ou entre collègues proches), le tutoiement ('tu') prévaut.\n\n"
                    f"Pour perfectionner votre compétence en {skill_clean.lower()}, veillez à respecter les liaisons obligatoires et à utiliser des structures de phrases claires adaptées au niveau {level_code}."
                )
                ext_dialogue = [
                    {"speaker": "Madame Dubois", "text": "Bonjour Monsieur Laurent, comment allez-vous aujourd'hui ?", "translation": "Hello Mr. Laurent, how are you today?"},
                    {"speaker": "Monsieur Laurent", "text": "Bonjour Madame Dubois. Je vais très bien, merci. Et vous-même ?", "translation": "Hello Mrs. Dubois. I am doing very well, thank you. And yourself?"},
                    {"speaker": "Madame Dubois", "text": "Très bien aussi ! Je vous présente ma nouvelle collègue, Sophie.", "translation": "Very well too! Let me introduce my new colleague, Sophie."},
                    {"speaker": "Sophie", "text": "Enchantée de faire votre connaissance, Monsieur Laurent.", "translation": "Pleased to meet you, Mr. Laurent."},
                    {"speaker": "Monsieur Laurent", "text": f"Enchanté Sophie ! Bienvenue dans notre équipe. Nous étudions le thème '{topic_clean}'.", "translation": f"Pleased to meet you Sophie! Welcome to our team. We are studying '{topic_clean}'."},
                    {"speaker": "Madame Dubois", "text": f"C'est un sujet essentiel pour le niveau {level_code}. Nous devons aller en réunion. Au revoir !", "translation": f"It is an essential topic for level {level_code}. We must go to a meeting. Goodbye!"},
                    {"speaker": "Monsieur Laurent", "text": "Au revoir Madame Dubois, à bientôt et bonne journée !", "translation": "Goodbye Mrs. Dubois, see you soon and have a good day!"}
                ]
                ext_vocab = [
                    {"word": "Bonjour / Bonsoir", "partOfSpeech": "interjection", "translation": "Hello / Good evening", "example": "Bonjour Madame, comment allez-vous ?"},
                    {"word": "Au revoir / À bientôt", "partOfSpeech": "interjection", "translation": "Goodbye / See you soon", "example": "Au revoir et à demain !"},
                    {"word": "Comment allez-vous ?", "partOfSpeech": "expression", "translation": "How are you? (Formal)", "example": "Comment allez-vous ce matin ?"},
                    {"word": "Enchanté(e)", "partOfSpeech": "adjectif", "translation": "Pleased to meet you", "example": "Enchanté de vous rencontrer."},
                    {"word": "S'il vous plaît", "partOfSpeech": "expression", "translation": "Please (Formal)", "example": "Un café, s'il vous plaît."},
                    {"word": "Merci beaucoup", "partOfSpeech": "expression", "translation": "Thank you very much", "example": "Merci beaucoup pour votre aide."},
                    {"word": "De rien / Je vous en prie", "partOfSpeech": "expression", "translation": "You're welcome", "example": "Je vous en prie, c'est naturel."},
                    {"word": "Excusez-moi / Pardon", "partOfSpeech": "expression", "translation": "Excuse me / Sorry", "example": "Excusez-moi, où se trouve la gare ?"},
                    {"word": "Monsieur / Madame", "partOfSpeech": "nom", "translation": "Mr. / Mrs. / Madam", "example": "Bonjour Monsieur le Directeur."},
                    {"word": "À plus tard / Salut", "partOfSpeech": "expression informelle", "translation": "See you later / Bye", "example": "Salut, à plus tard !"}
                ]
                ext_grammar = (
                    f"### Règles Grammaticales & Syntaxe : '{topic_clean}' (Niveau {level_code})\n\n"
                    f"1. **Le Vouvoiement vs. Le Tutoiement** :\n"
                    f"   - **Vous** (Formel / Pluriel) : Utilisé avec les adultes non proches et dans le travail. Ex : *Comment allez-vous ?*\n"
                    f"   - **Tu** (Informel / Singulier) : Utilisé avec les amis et la famille. Ex : *Comment vas-tu ?*\n\n"
                    f"2. **Conjugaison du verbe ÊTRE et ALLER (Présent)** :\n"
                    f"   - *Je suis / Je vais*\n"
                    f"   - *Tu es / Tu vas*\n"
                    f"   - *Il/Elle est / Il/Elle va*\n"
                    f"   - *Nous sommes / Nous allons*\n"
                    f"   - *Vous êtes / Vous allez*\n"
                    f"   - *Ils/Elles sont / Ils/Elles vont*\n\n"
                    f"3. **Liaisons Obligatoires** :\n"
                    f"   - En français parlé, la liaison entre la consonne finale muette et la voyelle suivante est requise. Ex : *Vous_êtes*, *Comment_allez-vous ?*"
                )
            elif "japanese" in lang_name.lower():
                ext_overview = (
                    f"日本語学習（{level_code}レベル）における「{topic_clean}」のマスターガイドです。"
                    f"基本的な丁寧語（です・ます形）の活用と、日常生活で頻出するコミュニケーション表現を深く学びます。"
                )
                ext_body = (
                    f"日本における「{topic_clean}」に関する会話では、相手との関係性（初対面、目上、同僚、友人）に応じた言葉遣いの使い分けが極めて重要です。\n\n"
                    f"時間帯別の挨拶（おはようございます、こんにちは、こんばんは）に加え、自己紹介の基本パターン「私（わたくし）は〜です」や、"
                    f"感謝を表す「ありがとうございます」、依頼や配慮を表す「よろしくお願いします」などの定型句をしっかり身につけましょう。\n\n"
                    f"{skill_clean}の練習では、正しい発音、イントネーション、および助詞（は、が、を、に、で）の自然な配置を意識することがポイントです。"
                )
                ext_dialogue = [
                    {"speaker": "田中先生", "text": "木村さん、おはようございます！きょうも良い天気ですね。", "translation": "Ms. Kimura, good morning! It's good weather today too, isn't it?"},
                    {"speaker": "木村", "text": "おはようございます、田中先生！はい、とても気持ちが良い朝ですね。", "translation": "Good morning, Professor Tanaka! Yes, it's a very pleasant morning."},
                    {"speaker": "田中先生", "text": f"こちらは新しい留学生のマイクさんです。きょうは「{topic_clean}」の勉強をします。", "translation": f"This is the new international student Mike. Today we study '{topic_clean}'."},
                    {"speaker": "マイク", "text": "はじめまして、マイクです。アメリカから来ました。どうぞよろしくお願いします！", "translation": "Nice to meet you, I am Mike. I came from America. Pleased to meet you!"},
                    {"speaker": "木村", "text": "はじめまして、木村です。こちらこそ、よろしくお願いします！", "translation": "Nice to meet you, I am Kimura. Pleased to meet you too!"},
                    {"speaker": "田中先生", "text": "それでは授業を始めましょう。みなさん、準備はいいですか。", "translation": "Then let's start the lesson. Is everyone ready?"},
                    {"speaker": "マイク・木村", "text": "はい！よろしくお願いします！", "translation": "Yes! We look forward to the lesson!"}
                ]
                ext_vocab = [
                    {"word": "おはようございます", "partOfSpeech": "感動詞/挨拶", "translation": "Good morning (Polite)", "example": "先生、おはようございます！"},
                    {"word": "こんにちは", "partOfSpeech": "感動詞/挨拶", "translation": "Good afternoon / Hello", "example": "みなさん、こんにちは。"},
                    {"word": "こんばんは", "partOfSpeech": "感動詞/挨拶", "translation": "Good evening", "example": "こんばんは、いらっしゃいませ。"},
                    {"word": "はじめまして", "partOfSpeech": "感動詞/挨拶", "translation": "Nice to meet you (First time)", "example": "はじめまして、田中です。"},
                    {"word": "よろしくお願いします", "partOfSpeech": "定型表現", "translation": "Pleased to meet/work with you", "example": "どうぞよろしくお願いします。"},
                    {"word": "ありがとうございます", "partOfSpeech": "感動詞/感謝", "translation": "Thank you very much", "example": "ご指導ありがとうございます。"},
                    {"word": "すみません", "partOfSpeech": "感動詞/詫び", "translation": "Excuse me / Sorry", "example": "すみません、駅はどこですか。"},
                    {"word": "さようなら", "partOfSpeech": "感動詞/別れ", "translation": "Goodbye", "example": "先生、さようなら。"},
                    {"word": "おやすみなさい", "partOfSpeech": "感動詞/別れ", "translation": "Good night", "example": "おやすみなさい、また明日。"},
                    {"word": "はい / いいえ", "partOfSpeech": "応答表現", "translation": "Yes / No", "example": "はい、承知いたしました。"}
                ]
                ext_grammar = (
                    f"### 文法ポイント & 構文解説：「{topic_clean}」（{level_code}レベル）\n\n"
                    f"1. **基本文型「X は Y です」** :\n"
                    f"   - 助詞「は（発音：wa）」は文の主題を提示します。\n"
                    f"   - 例文：*私（X）は（wa）マイク（Y）です（desu）。*（I am Mike.）\n\n"
                    f"2. **丁寧語「です・ます」活用** :\n"
                    f"   - 名詞・形容詞の文末：〜です（過去形：〜でした）\n"
                    f"   - 動詞の文末：〜ます（過去形：〜ました、否定形：〜ません）\n\n"
                    f"3. **疑問文の作り方（助詞「か」）** :\n"
                    f"   - 文末に助詞「か」を付けると質問文になります。\n"
                    f"   - 例文：*お元気ですか。（O-genki desu ka?）*"
                )
            else: # German (Default)
                ext_overview = (
                    f"In diesem umfassenden Studienmaterial zum Thema '{topic_clean}' (CEFR {level_code}) lernen Sie die praxisnahe "
                    f"Anwendung von Wortschatz, Dialogmustern und Grammatikstrukturen für die Fertigkeit {skill_clean}."
                )
                ext_body = (
                    f"In allen deutschsprachigen Ländern (Deutschland, Österreich, Schweiz) ist die Beherrschung von '{topic_clean}' ein zentraler Baustein für erfolgreiche Alltagskommunikation.\n\n"
                    f"Formelle und informelle Anredeformen unterscheiden sich im Deutschen strikt: Während im beruflichen Umfeld, an der Universität oder gegenüber Fremden die Sie-Form mit Nachnamen ('Sie' / 'Ihnen') gilt, "
                    f"nutzt man unter Freunden, Familie und Studienkollegen die Du-Form ('du' / 'dir').\n\n"
                    f"Um Ihre Fähigkeiten im Bereich {skill_clean} nachhaltig zu verbessern, sollten Sie die Satzstrukturen (V2-Regel im Hauptsatz), die Konjugation der Hilfsverben 'sein' und 'haben' "
                    f"sowie die korrekte Aussprache regelmäßig einüben."
                )
                ext_dialogue = [
                    {"speaker": "Herr Müller (Abteilungsleiter)", "text": "Guten Morgen, Frau Schneider! Wie geht es Ihnen heute an diesem schönen Morgen?", "translation": "Good morning, Mrs. Schneider! How are you today on this lovely morning?"},
                    {"speaker": "Frau Schneider (Dozentin)", "text": "Guten Morgen, Herr Müller! Vielen Dank, mir geht es sehr gut. Und wie geht es Ihnen?", "translation": "Good morning, Mr. Müller! Thank you very much, I am doing very well. And how are you?"},
                    {"speaker": "Herr Müller", "text": "Danke der Nachfrage, mir geht es auch wunderbar. Darf ich Ihnen unseren neuen Kollegen, Herrn Weber, vorstellen?", "translation": "Thanks for asking, I am doing wonderful too. May I introduce our new colleague, Mr. Weber, to you?"},
                    {"speaker": "Frau Schneider", "text": "Sehr erfreut, Herr Weber! Herzlich willkommen in unserer akademischen Abteilung.", "translation": "Pleased to meet you, Mr. Weber! Welcome to our academic department."},
                    {"speaker": "Herr Weber (Dozent)", "text": f"Guten Tag, Frau Schneider. Sehr erfreut, Sie kennenzulernen. Heute behandeln wir das Thema '{topic_clean}'.", "translation": f"Good day, Mrs. Schneider. Pleased to meet you. Today we treat the topic '{topic_clean}'."},
                    {"speaker": "Frau Schneider", "text": f"Das ist ein äußerst wichtiges Thema für unsere Studierenden auf Niveau {level_code}, um ihre {skill_clean}-Fertigkeiten zu festigen.", "translation": f"That is an extremely important topic for our students at level {level_code} to consolidate their {skill_clean} skills."},
                    {"speaker": "Herr Weber", "text": "Woher kommen Sie eigentlich, Frau Schneider, wenn ich fragen darf?", "translation": "Where do you actually come from, Mrs. Schneider, if I may ask?"},
                    {"speaker": "Frau Schneider", "text": "Ich komme aus Wien, wohne aber schon seit fünf Jahren hier in Berlin.", "translation": "I come from Vienna, but have been living here in Berlin for five years."},
                    {"speaker": "Herr Müller", "text": "Wir müssen jetzt leider zum Seminar im Hörsaal A. Auf Wiedersehen, Frau Schneider!", "translation": "We unfortunately have to go to the seminar in Lecture Hall A now. Goodbye, Mrs. Schneider!"},
                    {"speaker": "Frau Schneider", "text": "Auf Wiedersehen, meine Herren! Ich wünsche Ihnen noch einen erfolgreichen Arbeitstag!", "translation": "Goodbye gentlemen! I wish you a successful workday!"},
                    {"speaker": "Herr Weber", "text": "Vielen Dank, Frau Schneider! Auf Wiedersehen und bis später!", "translation": "Thank you very much Mrs. Schneider! Goodbye and see you later!"}
                ]
                ext_vocab = [
                    {"word": "Guten Morgen", "partOfSpeech": "Nomen / Phrase", "translation": "Good morning (5:00 - 11:00)", "example": "Guten Morgen, Herr Professor Schmidt!"},
                    {"word": "Guten Tag", "partOfSpeech": "Phrase", "translation": "Good day / Hello (11:00 - 18:00)", "example": "Guten Tag, wie kann ich Ihnen behilflich sein?"},
                    {"word": "Guten Abend", "partOfSpeech": "Phrase", "translation": "Good evening (after 18:00)", "example": "Guten Abend meine Damen und Herren."},
                    {"word": "Gute Nacht", "partOfSpeech": "Phrase", "translation": "Good night (before sleep)", "example": "Gute Nacht und schlaf gut, bis morgen!"},
                    {"word": "Auf Wiedersehen", "partOfSpeech": "Phrase", "translation": "Goodbye (Formal in person)", "example": "Auf Wiedersehen, Frau Schneider!"},
                    {"word": "Auf Wiederhören", "partOfSpeech": "Phrase", "translation": "Goodbye (Formal on phone)", "example": "Vielen Dank für Ihren Anruf. Auf Wiederhören!"},
                    {"word": "Tschüss", "partOfSpeech": "Interjektion", "translation": "Bye (Informal among friends)", "example": "Tschüss Thomas, wir sehen uns morgen!"},
                    {"word": "Wie geht es Ihnen?", "partOfSpeech": "Phrase", "translation": "How are you? (Formal)", "example": "Wie geht es Ihnen heute im neuen Büro?"},
                    {"word": "Sehr erfreut", "partOfSpeech": "Phrase / Adjektiv", "translation": "Pleased to meet you", "example": "Sehr erfreut, Ihre Bekanntschaft zu machen."},
                    {"word": "Entschuldigung", "partOfSpeech": "Nomen (die)", "translation": "Excuse me / Pardon", "example": "Entschuldigung, wissen Sie wo die Post ist?"},
                    {"word": "Danke schön / Vielen Dank", "partOfSpeech": "Phrase", "translation": "Thank you very much", "example": "Vielen Dank für Ihre freundliche Unterstützung."},
                    {"word": "Bitte schön", "partOfSpeech": "Phrase", "translation": "You're welcome / Here you go", "example": "Bitte schön, das ist für Sie."},
                    {"word": "Bis später", "partOfSpeech": "Phrase", "translation": "See you later", "example": "Tschüss Maria, bis später im Café!"},
                    {"word": "Bis morgen", "partOfSpeech": "Phrase", "translation": "See you tomorrow", "example": "Schönen Feierabend und bis morgen!"},
                    {"word": "Schönen Tag noch", "partOfSpeech": "Phrase", "translation": "Have a nice day", "example": "Danke gleichfalls, Ihnen auch einen schönen Tag!"},
                    {"word": "Herzlich willkommen", "partOfSpeech": "Phrase", "translation": "Welcome", "example": "Herzlich willkommen an unserer Universität!"}
                ]
                ext_grammar = (
                    f"### Grammatik-Architektur & Syntax-Regeln: '{topic_clean}' ({level_code})\n\n"
                    f"1. **Formell vs. Informell (Sie vs. Du)** :\n"
                    f"   - **Formell**: 'Sie' (großgeschrieben) + Nachname → *'Wie heißen Sie?'* / *'Wie geht es Ihnen?'*\n"
                    f"   - **Informell**: 'du' (kleingeschrieben) + Vorname → *'Wie heißt du?'* / *'Wie geht es dir?'*\n\n"
                    f"2. **Verbkonjugation im Präsens (sein & kommen)** :\n"
                    f"   - *ich bin / komme*\n"
                    f"   - *du bist / kommst*\n"
                    f"   - *er/sie/es ist / kommt*\n"
                    f"   - *Sie/wir/sie sind / kommen*\n\n"
                    f"3. **Hauptsatz-Syntax (V2-Regel)** :\n"
                    f"   - Im Aussagesatz steht das konjugierte Verb IMMER an Position 2.\n"
                    f"   - Beispiel: *'Heute (Pos. 1) **sprechen** (Pos. 2) wir über {topic_clean}.'*\n\n"
                    f"4. **Fragesätze mit W-Wörtern (W-Fragen)** :\n"
                    f"   - Fragewort + Verb + Subjekt?\n"
                    f"   - Beispiel: *'Wie (W-Wort) **heißen** (Verb) Sie (Subjekt)?'*"
                )

            item_copy["extracted_content"] = {
                "overview": ext_overview,
                "body": ext_body,
                "dialogueScript": ext_dialogue,
                "vocabularyList": ext_vocab,
                "grammarNotes": ext_grammar,
            }

            # Dynamically generate quiz questions matching the topic & skill if quiz requested
            if is_quiz_requested:
                item_copy["questions"] = [
                    {
                        "id": "q1",
                        "question": f"What is the primary focus when practicing {skill_clean} for '{topic_clean}' in {lang_name} ({level_code})?",
                        "options": [
                            f"Mastering key expressions & structures for {topic_clean}",
                            "Advanced mathematical differential equations",
                            "Western European medieval history dates",
                            "Organic chemistry molecular bond structures"
                        ],
                        "answer": f"Mastering key expressions & structures for {topic_clean}",
                        "explanation": f"In {lang_name} {level_code} ({skill_clean}), mastering essential phrases for '{topic_clean}' builds real-world fluency."
                    },
                    {
                        "id": "q2",
                        "question": f"Which exercise pattern best reinforces '{topic_clean}' for {level_code} {skill_clean} learners?",
                        "options": [
                            f"Targeted {skill_clean.lower()} drills focused on {topic_clean}",
                            "Rote memorization of unrelated vocabulary",
                            "Translating dictionary definitions out of context",
                            "Typing speed tests for non-language symbols"
                        ],
                        "answer": f"Targeted {skill_clean.lower()} drills focused on {topic_clean}",
                        "explanation": f"Directly practicing '{topic_clean}' accelerates skill retention for {level_code} learners."
                    },
                    {
                        "id": "q3",
                        "question": f"Select the standard CEFR {level_code} communication pattern for '{topic_clean}':",
                        "options": [
                            f"Using natural, polite {lang_name} sentence patterns for {topic_clean}",
                            "Using archaic regional dialect forms",
                            "Mixing random unrelated nouns and adjectives",
                            "Omitting all main verbs and subject markers"
                        ],
                        "answer": f"Using natural, polite {lang_name} sentence patterns for {topic_clean}",
                        "explanation": f"CEFR {level_code} emphasizes clear, polite communication patterns for '{topic_clean}'."
                    },
                    {
                        "id": "q4",
                        "question": f"Self-Assessment: How effectively can you apply {skill_clean} skills regarding '{topic_clean}'?",
                        "options": [
                            f"I can use core {topic_clean} expressions accurately in {lang_name}",
                            "I am unable to recognize any basic vocabulary",
                            "I only understand technical programming code",
                            "I require complete native translation for every word"
                        ],
                        "answer": f"I can use core {topic_clean} expressions accurately in {lang_name}",
                        "explanation": f"Reaching {level_code} proficiency means confidently applying '{topic_clean}' in practical situations."
                    }
                ]
            else:
                item_copy["questions"] = None

            output.append(item_copy)

        return output

    async def search(
        self,
        query: str,
        limit: int = 10,
        target_languages: Optional[List[str]] = None,
        target_levels: Optional[List[str]] = None,
        source_tab: Optional[str] = "Web",
        target_format: Optional[str] = None,
        topic: Optional[str] = None,
        skill: Optional[str] = None,
    ) -> List[SearchCandidateResult]:
        dicts = await self.search_candidates(
            keywords=query,
            target_languages=target_languages,
            target_levels=target_levels,
            source_tab=source_tab,
            target_format=target_format,
            topic=topic,
            skill=skill,
            limit=limit,
        )
        return [
            SearchCandidateResult(
                url=d["url"],
                title=d["title"],
                snippet=d["snippet"],
                source_name=d["source_name"],
                confidence=d.get("confidence", "HIGH"),
                questions=d.get("questions"),
                extracted_content=d.get("extracted_content"),
            )
            for d in dicts
        ]
