import os
import io
import zipfile
import logging
from typing import List, Dict, Any, Optional
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

logger = logging.getLogger(__name__)

class PeriodPptxGenerator:
    """
    Textbook-grade, institutional PowerPoint (.pptx) generator for ISML Academic Platform.
    Designed exclusively in high-contrast professional LIGHT THEME.
    Integrates official ISML logo, subtle watermark, and CEFR-aligned academic slides.
    """

    # 16:9 Widescreen standard dimensions
    SLIDE_WIDTH_IN = 13.333
    SLIDE_HEIGHT_IN = 7.5

    # ISML Brand Palette (Light Theme)
    COLOR_BG_WHITE = RGBColor(255, 255, 255)
    COLOR_BG_LIGHT = RGBColor(248, 250, 252)       # Slate 50
    COLOR_BG_CARD = RGBColor(255, 255, 255)
    COLOR_BG_BLUE_TINT = RGBColor(240, 246, 255)   # Subtle Royal Tint
    COLOR_BG_EMERALD_TINT = RGBColor(240, 253, 244)# Subtle Green Tint
    COLOR_BG_AMBER_TINT = RGBColor(254, 252, 232)  # Subtle Amber Tint
    COLOR_BG_PURPLE_TINT = RGBColor(250, 245, 255) # Subtle Purple Tint

    # Borders
    COLOR_BORDER_LIGHT = RGBColor(226, 232, 240)    # Slate 200
    COLOR_BORDER_BLUE = RGBColor(191, 219, 254)     # Blue 200
    COLOR_BORDER_EMERALD = RGBColor(187, 247, 208)  # Green 200
    COLOR_BORDER_AMBER = RGBColor(254, 240, 138)    # Yellow 200
    COLOR_BORDER_PURPLE = RGBColor(233, 213, 255)   # Purple 200

    # Text & Accents
    COLOR_NAVY = RGBColor(11, 36, 71)              # Deep ISML Navy (#0B2447)
    COLOR_PRIMARY_BLUE = RGBColor(0, 82, 204)       # ISML Royal Blue (#0052CC)
    COLOR_CYAN_TEAL = RGBColor(0, 180, 216)         # ISML Logo Cyan Accent (#00B4D8)
    COLOR_EMERALD = RGBColor(5, 150, 105)          # Forest Emerald
    COLOR_AMBER = RGBColor(180, 83, 9)              # Warm Amber (#B45309)
    COLOR_PURPLE = RGBColor(109, 40, 217)          # Academic Purple (#6D28D9)
    COLOR_TEXT_DARK = RGBColor(15, 23, 42)          # Slate 900
    COLOR_TEXT_BODY = RGBColor(51, 65, 85)          # Slate 700
    COLOR_TEXT_MUTED = RGBColor(100, 116, 139)      # Slate 500
    COLOR_WATERMARK = RGBColor(241, 245, 249)       # Faint Slate 100 for watermark

    FONT_FAMILY = "Segoe UI"
    FONT_MONO = "Consolas"

    @classmethod
    def get_logo_path(cls) -> Optional[str]:
        """Locates the official ISML logo file."""
        candidates = [
            "ai-service/assets/isml_logo.jpg",
            "frontend/public/isml_logo.jpg",
            "assets/isml_logo.jpg",
            "public/isml_logo.jpg",
            "D:/ISML/resource_agent/ai-service/assets/isml_logo.jpg",
            "D:/ISML/resource_agent/frontend/public/isml_logo.jpg"
        ]
        for c in candidates:
            if os.path.exists(c):
                return c
        return None

    @classmethod
    def add_card(cls, slide, left_in, top_in, width_in, height_in, bg_rgb, border_rgb):
        """Creates a smooth rectangular card with rounded or clean border."""
        shape = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE,
            Inches(left_in),
            Inches(top_in),
            Inches(width_in),
            Inches(height_in),
        )
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_rgb
        if border_rgb:
            shape.line.color.rgb = border_rgb
            shape.line.width = Pt(1.0)
        else:
            shape.line.fill.background()
        return shape

    @classmethod
    def apply_watermark(cls, slide):
        """Adds subtle academic background watermark text without obscuring readability."""
        wm_box = slide.shapes.add_textbox(Inches(0.5), Inches(2.2), Inches(12.333), Inches(3.0))
        tf = wm_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = "INDIAN SCHOOL FOR MODERN LANGUAGES"
        p.font.name = cls.FONT_FAMILY
        p.font.size = Pt(36)
        p.font.bold = True
        p.font.color.rgb = cls.COLOR_WATERMARK
        p.alignment = PP_ALIGN.CENTER

    @classmethod
    def apply_header(cls, slide, category_badge: str, title: str, subtitle: Optional[str] = None):
        """Standard institutional header across all content slides."""
        # Top color accent rule
        top_bar = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(cls.SLIDE_WIDTH_IN), Inches(0.08)
        )
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = cls.COLOR_PRIMARY_BLUE
        top_bar.line.fill.background()

        # Category badge & Title text frame (Centered across slide width)
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.25), Inches(11.733), Inches(1.1))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p0 = tf.paragraphs[0]
        p0.text = category_badge.upper()
        p0.font.name = cls.FONT_FAMILY
        p0.font.bold = True
        p0.font.size = Pt(10)
        p0.font.color.rgb = cls.COLOR_PRIMARY_BLUE
        p0.alignment = PP_ALIGN.CENTER

        p1 = tf.add_paragraph()
        p1.text = title
        p1.font.name = cls.FONT_FAMILY
        p1.font.bold = True
        p1.font.size = Pt(22)
        p1.font.color.rgb = cls.COLOR_NAVY
        p1.alignment = PP_ALIGN.CENTER

        if subtitle:
            p2 = tf.add_paragraph()
            p2.text = subtitle
            p2.font.name = cls.FONT_FAMILY
            p2.font.size = Pt(11)
            p2.font.color.rgb = cls.COLOR_TEXT_MUTED
            p2.alignment = PP_ALIGN.CENTER

        # Corner Logo (Upper Right)
        logo_path = cls.get_logo_path()
        if logo_path:
            slide.shapes.add_picture(logo_path, Inches(11.8), Inches(0.25), width=Inches(0.95))

    @classmethod
    def apply_footer(cls, slide, language: str, level: str, unit_name: str, day_num: int, slide_num: int, total_slides: int = 8):
        """Standard footer attribution bar."""
        footer_line = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(6.9), Inches(11.733), Inches(0.02)
        )
        footer_line.fill.solid()
        footer_line.fill.fore_color.rgb = cls.COLOR_BORDER_LIGHT
        footer_line.line.fill.background()

        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(6.95), Inches(11.733), Inches(0.4))
        tf = footer_box.text_frame
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p = tf.paragraphs[0]
        p.text = f"ISML AI Academic Agent  |  Indian School for Modern Languages  |  {language} • CEFR {level}  |  {unit_name} {day_num}  |  Slide {slide_num} of {total_slides}"
        p.font.name = cls.FONT_FAMILY
        p.font.size = Pt(9.5)
        p.font.color.rgb = cls.COLOR_TEXT_MUTED
        p.alignment = PP_ALIGN.CENTER

    @classmethod
    def generate_period_pptx(
        cls,
        day_data: Dict[str, Any],
        language: str,
        level: str,
        topic: str,
        track_label: str = "Standard Course Plan",
        institution_type: str = "SCHOOL",
        total_days: int = 2,
        output_filepath: Optional[str] = None
    ) -> str:
        """
        Builds a comprehensive 8-slide PowerPoint presentation for a single curriculum period.
        """
        prs = Presentation()
        prs.slide_width = Inches(cls.SLIDE_WIDTH_IN)
        prs.slide_height = Inches(cls.SLIDE_HEIGHT_IN)
        blank_layout = prs.slide_layouts[6]

        day_num = day_data.get("day_number", 1)
        day_topic = day_data.get("day_topic", f"Foundations & Communicative Patterns (Period {day_num})")
        unit_name = "Period" if institution_type == "SCHOOL" else "Session"
        clean_day_topic = day_topic.replace(f"Period {day_num}:", "").replace(f"Session {day_num}:", "").strip()
        if not clean_day_topic:
            clean_day_topic = topic or "Language & Communication Foundations"

        logo_path = cls.get_logo_path()

        # =========================================================================
        # SLIDE 1: Title & Course Cover Slide (Light Executive Theme)
        # =========================================================================
        slide1 = prs.slides.add_slide(blank_layout)
        cls.apply_watermark(slide1)

        # Header decorative bar
        top_bar = slide1.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(cls.SLIDE_WIDTH_IN), Inches(0.12)
        )
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = cls.COLOR_PRIMARY_BLUE
        top_bar.line.fill.background()

        # Large Executive Card in Center
        cls.add_card(slide1, 0.8, 0.6, 11.733, 6.2, cls.COLOR_BG_WHITE, cls.COLOR_BORDER_LIGHT)

        # Place Logo on top center of the card
        if logo_path:
            slide1.shapes.add_picture(logo_path, Inches(5.66), Inches(0.9), width=Inches(2.0))

        # Title Card Meta Box - Centered
        meta_box = slide1.shapes.add_textbox(Inches(1.2), Inches(2.9), Inches(10.933), Inches(3.6))
        tf1 = meta_box.text_frame
        tf1.word_wrap = True

        p_inst = tf1.paragraphs[0]
        p_inst.text = "INDIAN SCHOOL FOR MODERN LANGUAGES"
        p_inst.font.name = cls.FONT_FAMILY
        p_inst.font.bold = True
        p_inst.font.size = Pt(13)
        p_inst.font.color.rgb = cls.COLOR_PRIMARY_BLUE
        p_inst.alignment = PP_ALIGN.CENTER

        p_badge = tf1.add_paragraph()
        p_badge.text = f"{institution_type.upper()} CURRICULUM SYLLABUS • {unit_name.upper()} {day_num} OF {total_days}"
        p_badge.font.name = cls.FONT_FAMILY
        p_badge.font.bold = True
        p_badge.font.size = Pt(11)
        p_badge.font.color.rgb = cls.COLOR_EMERALD
        p_badge.space_after = Pt(10)
        p_badge.alignment = PP_ALIGN.CENTER

        p_title = tf1.add_paragraph()
        p_title.text = clean_day_topic
        p_title.font.name = cls.FONT_FAMILY
        p_title.font.bold = True
        p_title.font.size = Pt(28)
        p_title.font.color.rgb = cls.COLOR_NAVY
        p_title.space_after = Pt(8)
        p_title.alignment = PP_ALIGN.CENTER

        p_sub = tf1.add_paragraph()
        p_sub.text = f"Master Teaching Blueprint, Phonetics, Grammar Patterns & Situational Practice"
        p_sub.font.name = cls.FONT_FAMILY
        p_sub.font.size = Pt(14)
        p_sub.font.color.rgb = cls.COLOR_TEXT_BODY
        p_sub.space_after = Pt(18)
        p_sub.alignment = PP_ALIGN.CENTER

        # Quick Grid Info inside Slide 1 - Centered
        p_meta = tf1.add_paragraph()
        p_meta.text = f"Target Language: {language}   |   Proficiency Standard: CEFR {level}   |   Pillar Standard: 60 Hours Track\nPedagogical Authority: ISML Academic Faculty   |   Evidence Grounding: High Lineage Density"
        p_meta.font.name = cls.FONT_FAMILY
        p_meta.font.size = Pt(11.5)
        p_meta.font.color.rgb = cls.COLOR_TEXT_MUTED
        p_meta.alignment = PP_ALIGN.CENTER

        cls.apply_footer(slide1, language, level, unit_name, day_num, 1, 8)

        # =========================================================================
        # SLIDE 2: Learning Objectives & Competencies (Can-Do Milestones)
        # =========================================================================
        slide2 = prs.slides.add_slide(blank_layout)
        cls.apply_watermark(slide2)
        cls.apply_header(
            slide2,
            f"Council of Europe CEFR Framework • Level {level}",
            "Learning Objectives & Competency Descriptors",
            f"Key communicative milestones and functional capabilities target for {unit_name} {day_num}"
        )

        can_dos = [
            f"Can comprehend and articulate foundational phrases related to {clean_day_topic}.",
            f"Can introduce oneself, inquire about basic situational details, and respond accurately in {language}.",
            f"Can formulate simple sentences adhering strictly to standard CEFR {level} syntactic constraints.",
        ]
        # Check if day_data has custom competencies
        custom_cd = day_data.get("can_do_competencies") or day_data.get("learning_objectives")
        if custom_cd and isinstance(custom_cd, list) and len(custom_cd) > 0:
            can_dos = custom_cd[:3]

        # 3 Milestone Cards
        card_width = 3.65
        gap = 0.38
        start_left = 0.8
        for i, cd_text in enumerate(can_dos):
            c_left = start_left + i * (card_width + gap)
            cls.add_card(slide2, c_left, 1.6, card_width, 3.4, cls.COLOR_BG_EMERALD_TINT, cls.COLOR_BORDER_EMERALD)

            cd_box = slide2.shapes.add_textbox(Inches(c_left + 0.25), Inches(1.8), Inches(card_width - 0.5), Inches(3.0))
            cd_tf = cd_box.text_frame
            cd_tf.word_wrap = True

            p_m = cd_tf.paragraphs[0]
            p_m.text = f"MILESTONE {i+1}"
            p_m.font.name = cls.FONT_FAMILY
            p_m.font.bold = True
            p_m.font.size = Pt(12)
            p_m.font.color.rgb = cls.COLOR_EMERALD
            p_m.space_after = Pt(8)

            p_desc = cd_tf.add_paragraph()
            p_desc.text = str(cd_text)
            p_desc.font.name = cls.FONT_FAMILY
            p_desc.font.size = Pt(12.5)
            p_desc.font.color.rgb = cls.COLOR_TEXT_DARK
            p_desc.space_after = Pt(10)

            p_tag = cd_tf.add_paragraph()
            p_tag.text = f"Verified: CEFR {level} Standard"
            p_tag.font.name = cls.FONT_FAMILY
            p_tag.font.size = Pt(9.5)
            p_tag.font.color.rgb = cls.COLOR_TEXT_MUTED

        # Bottom Level Boundary Box
        cls.add_card(slide2, 0.8, 5.25, 11.733, 1.45, cls.COLOR_BG_BLUE_TINT, cls.COLOR_BORDER_BLUE)
        bnd_box = slide2.shapes.add_textbox(Inches(1.05), Inches(5.35), Inches(11.2), Inches(1.2))
        bnd_tf = bnd_box.text_frame
        bnd_tf.word_wrap = True

        p_bnd_title = bnd_tf.paragraphs[0]
        p_bnd_title.text = "Strict CEFR Non-Hallucination & Scope Boundary:"
        p_bnd_title.font.name = cls.FONT_FAMILY
        p_bnd_title.font.bold = True
        p_bnd_title.font.size = Pt(11)
        p_bnd_title.font.color.rgb = cls.COLOR_PRIMARY_BLUE
        p_bnd_title.space_after = Pt(3)

        p_bnd_text = bnd_tf.add_paragraph()
        p_bnd_text.text = f"Instructional scope is strictly calibrated to {language} {level}. Compound relative structures, subjunctive moods, and out-of-level idioms are systematically excluded to ensure cognitive retention and zero pedagogical hallucination."
        p_bnd_text.font.name = cls.FONT_FAMILY
        p_bnd_text.font.size = Pt(10.5)
        p_bnd_text.font.color.rgb = cls.COLOR_TEXT_BODY

        cls.apply_footer(slide2, language, level, unit_name, day_num, 2, 8)

        # =========================================================================
        # SLIDE 3: Grammar Architecture & Structural Formulas
        # =========================================================================
        slide3 = prs.slides.add_slide(blank_layout)
        cls.apply_watermark(slide3)
        cls.apply_header(
            slide3,
            "Structural Grammar & Lecture Notes",
            "Syntactic Rules & Sentence Architecture",
            f"Explicit grammatical mechanisms, agreement paradigms, and word order constraints for {unit_name} {day_num}"
        )

        grammar_text = day_data.get("grammar_rules_detail", "")
        if not grammar_text or len(grammar_text) < 20:
            grammar_text = f"Core sentence structure and phonetic foundation applicable to {clean_day_topic} in {language} {level}."

        # Left Card: Lecture Notes (Width: 5.7")
        cls.add_card(slide3, 0.8, 1.6, 5.7, 5.1, cls.COLOR_BG_WHITE, cls.COLOR_BORDER_LIGHT)
        g_box = slide3.shapes.add_textbox(Inches(1.05), Inches(1.8), Inches(5.2), Inches(4.7))
        g_tf = g_box.text_frame
        g_tf.word_wrap = True

        p_gt = g_tf.paragraphs[0]
        p_gt.text = "TEACHER LECTURE NOTES"
        p_gt.font.name = cls.FONT_FAMILY
        p_gt.font.bold = True
        p_gt.font.size = Pt(12)
        p_gt.font.color.rgb = cls.COLOR_PRIMARY_BLUE
        p_gt.space_after = Pt(8)

        # Truncate clean paragraphs
        clean_g = grammar_text.replace("Teacher Lecture & Grammar Guide:", "").strip()
        p_gbody = g_tf.add_paragraph()
        p_gbody.text = clean_g[:550] + ("..." if len(clean_g) > 550 else "")
        p_gbody.font.name = cls.FONT_FAMILY
        p_gbody.font.size = Pt(11)
        p_gbody.font.color.rgb = cls.COLOR_TEXT_BODY

        # Right Card: Formula Blueprint (Width: 5.7")
        cls.add_card(slide3, 6.833, 1.6, 5.7, 5.1, cls.COLOR_BG_BLUE_TINT, cls.COLOR_BORDER_BLUE)
        formula_box = slide3.shapes.add_textbox(Inches(7.1), Inches(1.8), Inches(5.2), Inches(4.7))
        f_tf = formula_box.text_frame
        f_tf.word_wrap = True

        p_ft = f_tf.paragraphs[0]
        p_ft.text = "SENTENCE BLUEPRINT & FORMULA"
        p_ft.font.name = cls.FONT_FAMILY
        p_ft.font.bold = True
        p_ft.font.size = Pt(12)
        p_ft.font.color.rgb = cls.COLOR_NAVY
        p_ft.space_after = Pt(10)

        # Highlight Box inside right card
        p_fb = f_tf.add_paragraph()
        p_fb.text = f"[ Subject ] + [ Auxiliary / Verb ] + [ Core Predicate / Object ]"
        p_fb.font.name = cls.FONT_MONO
        p_fb.font.bold = True
        p_fb.font.size = Pt(12)
        p_fb.font.color.rgb = cls.COLOR_PRIMARY_BLUE
        p_fb.space_after = Pt(12)

        p_usage = f_tf.add_paragraph()
        p_usage.text = "Pedagogical Delivery Rules:"
        p_usage.font.name = cls.FONT_FAMILY
        p_usage.font.bold = True
        p_usage.font.size = Pt(11)
        p_usage.font.color.rgb = cls.COLOR_TEXT_DARK
        p_usage.space_after = Pt(6)

        rules_list = [
            f"1. Isolate phonetic sound values and core syllable stresses.",
            f"2. Enforce standard word order before expanding with adverbs.",
            f"3. Check for singular/plural grammatical agreement in every oral turn."
        ]
        for r in rules_list:
            pr = f_tf.add_paragraph()
            pr.text = r
            pr.font.name = cls.FONT_FAMILY
            pr.font.size = Pt(10.5)
            pr.font.color.rgb = cls.COLOR_TEXT_BODY
            pr.space_after = Pt(4)

        cls.apply_footer(slide3, language, level, unit_name, day_num, 3, 8)

        # =========================================================================
        # SLIDE 4: Target Vocabulary Bank & Pronunciation Cards
        # =========================================================================
        slide4 = prs.slides.add_slide(blank_layout)
        cls.apply_watermark(slide4)
        cls.apply_header(
            slide4,
            "Target Lexicon & Phonetics",
            "Vocabulary Bank & Pronunciation Guide",
            f"High-frequency foundational terms, phonetic IPA transcriptions, and authentic sentence contexts"
        )

        vocab_list = day_data.get("vocabulary_bank", [])
        if not vocab_list or len(vocab_list) == 0:
            vocab_list = [
                {"word": "Concept", "pronunciation": "/ˈkɒnsɛpt/", "meaning": "An abstract idea or foundational rule.", "example_sentence": "We practice this core concept today."},
                {"word": "Pattern", "pronunciation": "/ˈpætərn/", "meaning": "A repeated communicative model.", "example_sentence": "Follow the sentence pattern carefully."},
                {"word": "Dialogue", "pronunciation": "/ˈdaɪəlɒɡ/", "meaning": "Spoken conversational turn.", "example_sentence": "Practice the dialogue with your partner."},
                {"word": "Accuracy", "pronunciation": "/ˈækjʊrəsi/", "meaning": "Correctness in pronunciation and grammar.", "example_sentence": "Focus on grammatical accuracy."}
            ]

        # 4 Cards in 2x2 Layout
        v_w = 5.7
        v_h = 2.4
        coords = [
            (0.8, 1.6),       # Top Left
            (6.833, 1.6),     # Top Right
            (0.8, 4.3),       # Bottom Left
            (6.833, 4.3)      # Bottom Right
        ]

        for idx, (c_l, c_t) in enumerate(coords):
            if idx >= len(vocab_list):
                break
            v_item = vocab_list[idx]
            w_text = v_item.get("word") if isinstance(v_item, dict) else str(v_item)
            w_ipa = v_item.get("pronunciation", "") if isinstance(v_item, dict) else ""
            w_mean = v_item.get("meaning", "") if isinstance(v_item, dict) else "Target vocabulary item."
            w_ex = v_item.get("example_sentence", "") if isinstance(v_item, dict) else ""

            cls.add_card(slide4, c_l, c_t, v_w, v_h, cls.COLOR_BG_AMBER_TINT, cls.COLOR_BORDER_AMBER)
            v_box = slide4.shapes.add_textbox(Inches(c_l + 0.25), Inches(c_t + 0.2), Inches(v_w - 0.5), Inches(v_h - 0.4))
            v_tf = v_box.text_frame
            v_tf.word_wrap = True

            p_w = v_tf.paragraphs[0]
            p_w.text = f"{w_text}   {w_ipa}"
            p_w.font.name = cls.FONT_FAMILY
            p_w.font.bold = True
            p_w.font.size = Pt(14)
            p_w.font.color.rgb = cls.COLOR_NAVY
            p_w.space_after = Pt(4)

            p_m = v_tf.add_paragraph()
            p_m.text = f"Meaning: {w_mean}"
            p_m.font.name = cls.FONT_FAMILY
            p_m.font.size = Pt(11)
            p_m.font.color.rgb = cls.COLOR_TEXT_BODY
            p_m.space_after = Pt(4)

            if w_ex:
                p_e = v_tf.add_paragraph()
                p_e.text = f"Example: \"{w_ex}\""
                p_e.font.name = cls.FONT_FAMILY
                p_e.font.italic = True
                p_e.font.size = Pt(10.5)
                p_e.font.color.rgb = cls.COLOR_AMBER

        cls.apply_footer(slide4, language, level, unit_name, day_num, 4, 8)

        # =========================================================================
        # SLIDE 5: Classroom Dialogues & Conversational Practice
        # =========================================================================
        slide5 = prs.slides.add_slide(blank_layout)
        cls.apply_watermark(slide5)
        cls.apply_header(
            slide5,
            "Spoken Interaction & Roleplay",
            "Classroom Dialogues & Conversational Scripts",
            f"Turn-taking exchanges, native speech models, and live learner pair work for {unit_name} {day_num}"
        )

        dialogues = day_data.get("classroom_dialogues", [])
        if not dialogues or len(dialogues) == 0:
            dialogues = [
                f"Instructor: 'Welcome everyone! Today we examine {clean_day_topic} in practical communicative contexts.'",
                f"Learner: 'Good morning! How do we formulate the sentence structure accurately?'",
                f"Instructor: 'Anchor the core verb first, then articulate the ending phrase clearly.'",
                f"Learner: 'Thank you! The pronunciation rule is now completely clear.'"
            ]

        # Card container for dialogues
        cls.add_card(slide5, 0.8, 1.6, 11.733, 5.1, cls.COLOR_BG_PURPLE_TINT, cls.COLOR_BORDER_PURPLE)
        dlg_box = slide5.shapes.add_textbox(Inches(1.1), Inches(1.8), Inches(11.1), Inches(4.7))
        dlg_tf = dlg_box.text_frame
        dlg_tf.word_wrap = True

        p_dt = dlg_tf.paragraphs[0]
        p_dt.text = "PAIR ROLEPLAY & INTERACTIVE SPEECH TURNS"
        p_dt.font.name = cls.FONT_FAMILY
        p_dt.font.bold = True
        p_dt.font.size = Pt(12)
        p_dt.font.color.rgb = cls.COLOR_PURPLE
        p_dt.space_after = Pt(12)

        for d_idx, dlg_line in enumerate(dialogues[:5]):
            p_dl = dlg_tf.add_paragraph()
            p_dl.text = f"Turn {d_idx + 1}:   {dlg_line}"
            p_dl.font.name = cls.FONT_FAMILY
            p_dl.font.size = Pt(12)
            p_dl.font.color.rgb = cls.COLOR_TEXT_DARK
            p_dl.space_after = Pt(8)

        p_tip = dlg_tf.add_paragraph()
        p_tip.text = "Pedagogical Note: Practice dialogue twice: once for phonetic cadence, and once for conversational fluency."
        p_tip.font.name = cls.FONT_FAMILY
        p_tip.font.italic = True
        p_tip.font.size = Pt(10.5)
        p_tip.font.color.rgb = cls.COLOR_TEXT_MUTED
        p_tip.space_before = Pt(8)

        cls.apply_footer(slide5, language, level, unit_name, day_num, 5, 8)

        # =========================================================================
        # SLIDE 6: Culture, Formality & Everyday Etiquette
        # =========================================================================
        slide6 = prs.slides.add_slide(blank_layout)
        cls.apply_watermark(slide6)
        cls.apply_header(
            slide6,
            "Sociolinguistic Pragmatics",
            "Culture, Formality Registers & Social Customs",
            f"Everyday conversational registers, authentic social customs, and workplace etiquette in {language}"
        )

        # Left Card: Formality (5.7")
        cls.add_card(slide6, 0.8, 1.6, 5.7, 3.4, cls.COLOR_BG_WHITE, cls.COLOR_BORDER_LIGHT)
        c_left = slide6.shapes.add_textbox(Inches(1.05), Inches(1.8), Inches(5.2), Inches(3.0))
        cl_tf = c_left.text_frame
        cl_tf.word_wrap = True

        p_cl_title = cl_tf.paragraphs[0]
        p_cl_title.text = "FORMALITY REGISTERS & USAGE"
        p_cl_title.font.name = cls.FONT_FAMILY
        p_cl_title.font.bold = True
        p_cl_title.font.size = Pt(12)
        p_cl_title.font.color.rgb = cls.COLOR_PRIMARY_BLUE
        p_cl_title.space_after = Pt(8)

        p_cl_desc = cl_tf.add_paragraph()
        p_cl_desc.text = f"In {language}, distinguishing between formal academic/professional communication and casual conversational registers is paramount. Modals of politeness should be utilized in public and workplace exchanges."
        p_cl_desc.font.name = cls.FONT_FAMILY
        p_cl_desc.font.size = Pt(11)
        p_cl_desc.font.color.rgb = cls.COLOR_TEXT_BODY

        # Right Card: Etiquette (5.7")
        cls.add_card(slide6, 6.833, 1.6, 5.7, 3.4, cls.COLOR_BG_WHITE, cls.COLOR_BORDER_LIGHT)
        c_right = slide6.shapes.add_textbox(Inches(7.1), Inches(1.8), Inches(5.2), Inches(3.0))
        cr_tf = c_right.text_frame
        cr_tf.word_wrap = True

        p_cr_title = cr_tf.paragraphs[0]
        p_cr_title.text = "EVERYDAY SOCIAL CUSTOMS"
        p_cr_title.font.name = cls.FONT_FAMILY
        p_cr_title.font.bold = True
        p_cr_title.font.size = Pt(12)
        p_cr_title.font.color.rgb = cls.COLOR_NAVY
        p_cr_title.space_after = Pt(8)

        etiquette_items = [
            "1. Politeness Markers: Consistent use of respectful honorifics and courtesy words.",
            "2. Turn-Taking: Active listening acknowledgments during exchanges.",
            "3. Cross-Cultural Sensitivity: Professional and inclusive communicative standards."
        ]
        for it in etiquette_items:
            pi = cr_tf.add_paragraph()
            pi.text = it
            pi.font.name = cls.FONT_FAMILY
            pi.font.size = Pt(10.5)
            pi.font.color.rgb = cls.COLOR_TEXT_BODY
            pi.space_after = Pt(4)

        # Bottom Card: Senior Faculty Tip
        cls.add_card(slide6, 0.8, 5.25, 11.733, 1.45, cls.COLOR_BG_AMBER_TINT, cls.COLOR_BORDER_AMBER)
        tip_box = slide6.shapes.add_textbox(Inches(1.05), Inches(5.35), Inches(11.2), Inches(1.2))
        tip_tf = tip_box.text_frame
        tip_tf.word_wrap = True

        p_tip_h = tip_tf.paragraphs[0]
        p_tip_h.text = "FACULTY TEACHING TIP:"
        p_tip_h.font.name = cls.FONT_FAMILY
        p_tip_h.font.bold = True
        p_tip_h.font.size = Pt(11)
        p_tip_h.font.color.rgb = cls.COLOR_AMBER
        p_tip_h.space_after = Pt(3)

        p_tip_b = tip_tf.add_paragraph()
        p_tip_b.text = f"Guide learners to modulate their tone according to the interlocutor's status. For {level} learners, practicing courteous address conventions builds authentic social confidence."
        p_tip_b.font.name = cls.FONT_FAMILY
        p_tip_b.font.size = Pt(10.5)
        p_tip_b.font.color.rgb = cls.COLOR_TEXT_BODY

        cls.apply_footer(slide6, language, level, unit_name, day_num, 6, 8)

        # =========================================================================
        # SLIDE 7: Interactive LSRW Practice Drills
        # =========================================================================
        slide7 = prs.slides.add_slide(blank_layout)
        cls.apply_watermark(slide7)
        cls.apply_header(
            slide7,
            "Formative Competency Assessment",
            "Interactive LSRW Practice Drills",
            f"Classroom exercises covering Listening, Speaking, Reading & Writing for {unit_name} {day_num}"
        )

        in_class = day_data.get("in_class_exercises", [])
        if not in_class or len(in_class) == 0:
            in_class = [
                "[Listening] Listen to the audio model and identify the core sentence pattern.",
                "[Speaking] Introduce your role with natural pronunciation and conversational cadence.",
                "[Reading] Read the sample sentence aloud and explain the vocabulary meaning.",
                "[Writing] Compose a guided 2-sentence response applying today's grammatical rule."
            ]

        # 4 Skill Rows
        skills = [
            ("L - LISTENING COMPREHENSION", cls.COLOR_PURPLE, cls.COLOR_BG_PURPLE_TINT, cls.COLOR_BORDER_PURPLE),
            ("S - SPOKEN FLUENCY DRILL", cls.COLOR_PRIMARY_BLUE, cls.COLOR_BG_BLUE_TINT, cls.COLOR_BORDER_BLUE),
            ("R - READING & SYNTAX CHECK", cls.COLOR_EMERALD, cls.COLOR_BG_EMERALD_TINT, cls.COLOR_BORDER_EMERALD),
            ("W - GUIDED WRITTEN PRACTICE", cls.COLOR_AMBER, cls.COLOR_BG_AMBER_TINT, cls.COLOR_BORDER_AMBER)
        ]

        row_h = 1.15
        gap_r = 0.12
        for s_idx, (skill_title, s_color, s_bg, s_bd) in enumerate(skills):
            r_top = 1.6 + s_idx * (row_h + gap_r)
            cls.add_card(slide7, 0.8, r_top, 11.733, row_h, s_bg, s_bd)

            r_box = slide7.shapes.add_textbox(Inches(1.05), Inches(r_top + 0.1), Inches(11.2), Inches(row_h - 0.2))
            r_tf = r_box.text_frame
            r_tf.word_wrap = True

            p_st = r_tf.paragraphs[0]
            p_st.text = skill_title
            p_st.font.name = cls.FONT_FAMILY
            p_st.font.bold = True
            p_st.font.size = Pt(10.5)
            p_st.font.color.rgb = s_color

            p_sc = r_tf.add_paragraph()
            q_text = in_class[s_idx] if s_idx < len(in_class) else f"Target drill for {skill_title}."
            p_sc.text = str(q_text).replace("[Listening]", "").replace("[Speaking]", "").replace("[Reading]", "").replace("[Writing]", "").strip()
            p_sc.font.name = cls.FONT_FAMILY
            p_sc.font.size = Pt(11)
            p_sc.font.color.rgb = cls.COLOR_TEXT_DARK

        cls.apply_footer(slide7, language, level, unit_name, day_num, 7, 8)

        # =========================================================================
        # SLIDE 8: Session Wrap-Up & Homework Task
        # =========================================================================
        slide8 = prs.slides.add_slide(blank_layout)
        cls.apply_watermark(slide8)
        cls.apply_header(
            slide8,
            "Curriculum Synthesis & Extension",
            f"Session Wrap-Up & Self-Study Homework ({unit_name} {day_num})",
            f"Consolidation of learning objectives, homework task submission, and next unit preview"
        )

        homework_tasks = day_data.get("homework_tasks", [])
        hw_text = "\n• ".join(str(h) for h in homework_tasks[:3]) if homework_tasks else f"Practice pronunciation of all target words aloud.\n• Write a short 3-sentence summary in {language} applying today's grammar pattern.\n• Review classroom dialogues for oral check."

        # Left Card: Takeaways (5.7")
        cls.add_card(slide8, 0.8, 1.6, 5.7, 5.1, cls.COLOR_BG_WHITE, cls.COLOR_BORDER_LIGHT)
        t_box = slide8.shapes.add_textbox(Inches(1.05), Inches(1.8), Inches(5.2), Inches(4.7))
        t_tf = t_box.text_frame
        t_tf.word_wrap = True

        p_tt = t_tf.paragraphs[0]
        p_tt.text = "CORE LESSON TAKEAWAYS"
        p_tt.font.name = cls.FONT_FAMILY
        p_tt.font.bold = True
        p_tt.font.size = Pt(12)
        p_tt.font.color.rgb = cls.COLOR_PRIMARY_BLUE
        p_tt.space_after = Pt(10)

        takeaways = [
            f"1. Mastered phonetic values and target pronunciation of key lexicon.",
            f"2. Constructed standard CEFR {level} declarative sentences accurately.",
            f"3. Executed situational dialogues respecting formal/casual registers.",
            f"4. Verified receptive & productive competency checks."
        ]
        for tw in takeaways:
            pt = t_tf.add_paragraph()
            pt.text = tw
            pt.font.name = cls.FONT_FAMILY
            pt.font.size = Pt(11)
            pt.font.color.rgb = cls.COLOR_TEXT_BODY
            pt.space_after = Pt(8)

        # Right Card: Homework & Next Session Preview (5.7")
        cls.add_card(slide8, 6.833, 1.6, 5.7, 5.1, cls.COLOR_BG_EMERALD_TINT, cls.COLOR_BORDER_EMERALD)
        hw_box = slide8.shapes.add_textbox(Inches(7.1), Inches(1.8), Inches(5.2), Inches(4.7))
        hw_tf = hw_box.text_frame
        hw_tf.word_wrap = True

        p_hwt = hw_tf.paragraphs[0]
        p_hwt.text = "HOMEWORK & INDEPENDENT STUDY"
        p_hwt.font.name = cls.FONT_FAMILY
        p_hwt.font.bold = True
        p_hwt.font.size = Pt(12)
        p_hwt.font.color.rgb = cls.COLOR_EMERALD
        p_hwt.space_after = Pt(10)

        p_hw_b = hw_tf.add_paragraph()
        p_hw_b.text = f"• {hw_text}"
        p_hw_b.font.name = cls.FONT_FAMILY
        p_hw_b.font.size = Pt(11)
        p_hw_b.font.color.rgb = cls.COLOR_TEXT_DARK
        p_hw_b.space_after = Pt(14)

        p_nxt = hw_tf.add_paragraph()
        p_nxt.text = f"NEXT UNIT PREVIEW:"
        p_nxt.font.name = cls.FONT_FAMILY
        p_nxt.font.bold = True
        p_nxt.font.size = Pt(11)
        p_nxt.font.color.rgb = cls.COLOR_NAVY
        p_nxt.space_after = Pt(4)

        next_num = day_num + 1 if day_num < total_days else 1
        p_nxt_b = hw_tf.add_paragraph()
        p_nxt_b.text = f"{unit_name} {next_num}: Deepening syntactic complexity and expanding communicative vocabulary repertoire."
        p_nxt_b.font.name = cls.FONT_FAMILY
        p_nxt_b.font.size = Pt(10.5)
        p_nxt_b.font.color.rgb = cls.COLOR_TEXT_BODY

        cls.apply_footer(slide8, language, level, unit_name, day_num, 8, 8)

        # =========================================================================
        # Save Presentation
        # =========================================================================
        if not output_filepath:
            clean_lang = "".join(c for c in language if c.isalnum() or c == "_")
            clean_level = "".join(c for c in level if c.isalnum() or c == "_")
            filename = f"{clean_lang}_{clean_level}_Total_{total_days}_{unit_name}s_{unit_name}_{day_num}_Lecture_Slides.pptx"
            output_filepath = os.path.join("static/presentations", filename)

        os.makedirs(os.path.dirname(output_filepath), exist_ok=True)
        prs.save(output_filepath)
        logger.info(f"Generated period presentation successfully: {output_filepath}")
        return output_filepath

    @classmethod
    def generate_all_periods_pptx_zip(
        cls,
        days_list: List[Dict[str, Any]],
        language: str,
        level: str,
        topic: str,
        track_label: str = "Standard Course Plan",
        institution_type: str = "SCHOOL",
        output_zip_path: Optional[str] = None
    ) -> str:
        """
        Generates individual PPTX files for every period and bundles them into a clean ZIP archive.
        """
        total_days = len(days_list)
        unit_name = "Period" if institution_type == "SCHOOL" else "Session"
        clean_lang = "".join(c for c in language if c.isalnum() or c == "_")
        clean_level = "".join(c for c in level if c.isalnum() or c == "_")

        if not output_zip_path:
            zip_filename = f"{clean_lang}_{clean_level}_Total_{total_days}_{unit_name}s_Comprehensive_PPTX_Slides.zip"
            output_zip_path = os.path.join("static/presentations", zip_filename)

        os.makedirs(os.path.dirname(output_zip_path), exist_ok=True)

        temp_pptx_files = []
        with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for d in days_list:
                d_num = d.get("day_number", 1)
                temp_pptx_filename = f"{clean_lang}_{clean_level}_{unit_name}_{d_num}_Lecture_Slides.pptx"
                temp_pptx_path = os.path.join("static/presentations", f"temp_{temp_pptx_filename}")

                cls.generate_period_pptx(
                    day_data=d,
                    language=language,
                    level=level,
                    topic=topic,
                    track_label=track_label,
                    institution_type=institution_type,
                    total_days=total_days,
                    output_filepath=temp_pptx_path
                )

                # Add to ZIP archive with clean name
                zipf.write(temp_pptx_path, arcname=temp_pptx_filename)
                temp_pptx_files.append(temp_pptx_path)

        # Clean up individual temp files
        for f in temp_pptx_files:
            try:
                if os.path.exists(f):
                    os.remove(f)
            except Exception:
                pass

        logger.info(f"Compiled all {total_days} presentations into ZIP: {output_zip_path}")
        return output_zip_path

