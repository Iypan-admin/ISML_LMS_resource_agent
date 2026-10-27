from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DayWiseLessonPlan(BaseModel):
    day_number: int
    module_week: str # e.g. "Week 1: Foundations & Phonetics"
    day_topic: str # e.g. "Day 1: Master Greetings, Formal vs Informal & Pronunciation Rules"
    grammar_rules_detail: str # Complete teacher lecture explanation with contrastive rules
    vocabulary_bank: List[Dict[str, str]] # [{'word': '...', 'meaning': '...', 'pronunciation': '...', 'example_sentence': '...'}]
    classroom_dialogues: List[str] # Live script for teachers to enact in class
    pedagogical_instructions: str # Faculty pedagogical advice on common student pitfalls & mnemonics
    study_notes_markdown: Optional[str] = None # Comprehensive textbook-grade study material with rules and tables
    video_breakdown_analysis: Optional[str] = None # In-depth analytical breakdown of reference video/materials for this day
    situational_applications: Optional[List[str]] = None # Real-world corporate & conversational scenarios
    homework_tasks: Optional[List[str]] = None # Daily assignment for students
    in_class_exercises: Optional[List[str]] = None # Optional drills if requested
    exercise_solutions: Optional[List[Dict[str, str]]] = None

class SessionPlanStep(BaseModel):
    step_number: int
    phase: str
    duration_minutes: Optional[int] = 15
    what_to_teach: str
    how_to_teach: str
    student_activity: str

class SessionPlanResult(BaseModel):
    session_title: str
    target_language: str
    target_level: str # A1, A2, B1, N5, TOPIK 1 etc.
    track_mode: str # STANDARD, INTERNSHIP, SUPER_INTERNSHIP
    total_curriculum_days: int # e.g. 60 Days (Super), 120 Days (Internship), 240 Days (Standard)
    curriculum_overview_summary: str
    learning_objectives: List[str]
    grammar_focus: List[str]
    key_vocabulary: List[str]
    # Deep Day-by-Day Master Teaching Roadmap
    day_wise_syllabus: List[DayWiseLessonPlan]
    homework_and_practice: List[str]

class SlideItem(BaseModel):
    slide_number: int
    slide_title: str
    bullet_points: List[str]
    teacher_cue: Optional[str] = None

class TeacherMaterialResult(BaseModel):
    presentation_title: str
    subtitle: str
    slides: List[SlideItem]
    handout_summary_markdown: str
    recommended_video_timestamp_notes: Optional[str] = None
    pptx_download_url: Optional[str] = None

class QuestionItem(BaseModel):
    question_number: int
    question: str
    options: Optional[List[str]] = None # for MCQs
    correct_answer: str
    explanation: Optional[str] = None

class ListeningModule(BaseModel):
    audio_transcript_passage: str
    audio_script_dialogue: str
    comprehension_questions: List[QuestionItem]

class ReadingModule(BaseModel):
    passage_title: str
    reading_text: str
    vocabulary_glossary: Dict[str, str] # word: meaning
    comprehension_questions: List[QuestionItem]

class SpeakingModule(BaseModel):
    situation_prompt: str
    roleplay_scenario: str
    pronunciation_hints: List[str]
    guiding_questions: List[str]
    sample_dialogue_answer: str

class WritingEvaluationRubric(BaseModel):
    criteria_name: str # e.g. "Grammar Accuracy", "Vocabulary Usage", "Coherence", "Task Completion"
    weight_percentage: int
    grading_prompt_instructions: str

class WritingModule(BaseModel):
    task_prompt: str
    word_count_guideline: str
    guiding_hints: List[str]
    sample_model_response: str
    evaluation_rubrics: List[WritingEvaluationRubric]

class StudentLSRWPackage(BaseModel):
    listening: ListeningModule
    reading: ReadingModule
    speaking: SpeakingModule
    writing: WritingModule

class FullSessionPackageResult(BaseModel):
    session_id: str
    topic: str
    language: str # French, German, Japanese, Spanish, Korean
    level: str # A1, A2, B1, etc.
    track_mode: str = "STANDARD" # STANDARD (12mo), INTERNSHIP (6-8mo), SUPER_INTERNSHIP (3-5mo)
    track_duration_label: str = "12 Months (Comprehensive Track)"
    session_plan: SessionPlanResult
    teacher_materials: TeacherMaterialResult
    student_lsrw: StudentLSRWPackage
    extracted_source_summary: Optional[str] = None
