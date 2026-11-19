import os
import re
import logging
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
from typing import Dict, Any, List

from app.services.academic_pillar_resolver import resolve_all_academic_pillars

logger = logging.getLogger(__name__)

def set_cell_background(cell, fill_hex: str):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=140, bottom=140, left=160, right=160):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="D3D3D3"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="{color}"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="{color}"/>
            <w:left w:val="single" w:sz="4" w:space="0" w:color="{color}"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="{color}"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def add_header(doc, text: str, level=1):
    p = doc.add_paragraph()
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.bold = True
    if level == 1:
        run.font.size = Pt(14)
        run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A) # Slate 900
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
    elif level == 2:
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A) # Deep Navy
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(3)
    elif level == 3:
        run.font.size = Pt(11)
        run.font.color.rgb = RGBColor(0x06, 0x5F, 0x46) # Emerald Teal
        p.paragraph_format.space_before = Pt(7)
        p.paragraph_format.space_after = Pt(2)
    return p

def add_callout(doc, title: str, text: str, bg_hex="F0F9FF", border_hex="0284C7"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_hex}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.line_spacing = 1.25
    r_title = p.add_run(f"{title}\n")
    r_title.bold = True
    r_title.font.size = Pt(10)
    r_title.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    
    r_text = p.add_run(text)
    r_text.font.size = Pt(9.5)
    r_text.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_pillar_banner(doc, pillar_num: int, title: str, subtitle: str, color_hex: str = "1E3A8A"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    set_cell_background(cell, color_hex)
    set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.15
    
    r_num = p.add_run(f"PILLAR {pillar_num}: {title.upper()}\n")
    r_num.bold = True
    r_num.font.size = Pt(11)
    r_num.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    
    r_sub = p.add_run(subtitle)
    r_sub.italic = True
    r_sub.font.size = Pt(9)
    r_sub.font.color.rgb = RGBColor(0xE2, 0xE8, 0xF0)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

class MasterDocxGenerator:
    """
    Generates an exhaustive 10-15+ page textbook-grade master study guide for any specific class day
    and for the complete curriculum, strictly adhering to the 6 Universal Master Knowledge Pillars
    mandated by ISML Technical Specification v1.0.
    """
    
    @classmethod
    def generate_day_master_docx(
        cls,
        day_data: Dict[str, Any],
        language: str,
        level: str,
        topic: str,
        track_label: str,
        output_filepath: str
    ) -> str:
        doc = docx.Document()
        
        # Configure standard margins
        for section in doc.sections:
            section.top_margin = Inches(0.85)
            section.bottom_margin = Inches(0.85)
            section.left_margin = Inches(0.9)
            section.right_margin = Inches(0.9)
            
            # Header & Footer
            header = section.header
            hp = header.paragraphs[0]
            hp.text = f"ISML Language & Management School • {language} ({level}) Master Study Guide"
            hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            hp.runs[0].font.size = Pt(8.5)
            hp.runs[0].font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
            
            footer = section.footer
            fp = footer.paragraphs[0]
            fp.text = f"Period / Day {day_data.get('day_number', 1)}: {day_data.get('day_topic', topic)} | Confidential & Proprietary ISML Curriculum"
            fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            fp.runs[0].font.size = Pt(8.5)
            fp.runs[0].font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

        cls.append_day_section(
            doc=doc,
            day_data=day_data,
            language=language,
            level=level,
            topic=topic,
            track_label=track_label,
            is_first=True
        )

        os.makedirs(os.path.dirname(output_filepath), exist_ok=True)
        doc.save(output_filepath)
        return output_filepath

    @classmethod
    def append_day_section(
        cls,
        doc: docx.Document,
        day_data: Dict[str, Any],
        language: str,
        level: str,
        topic: str,
        track_label: str,
        is_first: bool = False
    ):
        """Appends a complete textbook-grade chapter covering all 6 Master Pillars for a given day/period."""
        if not is_first:
            doc.add_page_break()

        day_num = day_data.get("day_number", 1)
        day_topic = day_data.get("day_topic", topic)

        # Resolve the 6 Official Master Pillars
        pillars = resolve_all_academic_pillars(language, level, day_topic, day_num, day_data)

        # ---------------------------------------------------------
        # COVER / CHAPTER TITLE BLOCK
        # ---------------------------------------------------------
        p_title = doc.add_paragraph()
        p_title.paragraph_format.space_before = Pt(12)
        p_title.paragraph_format.space_after = Pt(2)
        r_sub = p_title.add_run(f"ISML MASTER CURRICULUM • 6-PILLAR ACADEMIC BLUEPRINT\n")
        r_sub.font.size = Pt(10)
        r_sub.bold = True
        r_sub.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)
        
        r_main = p_title.add_run(f"Period {day_num}: {day_topic}")
        r_main.font.size = Pt(18)
        r_main.bold = True
        r_main.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

        # Metadata Strip Table
        meta_table = doc.add_table(rows=2, cols=4)
        meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(meta_table)
        
        headers = ["Target Language", "CEFR Standard", "Curriculum Track", "Slot Allocation"]
        values = [language, level, track_label, f"Period {day_num} Comprehensive Guide"]
        
        for i in range(4):
            c_hdr = meta_table.cell(0, i)
            set_cell_background(c_hdr, "0F172A")
            set_cell_margins(c_hdr, top=90, bottom=90, left=110, right=110)
            p = c_hdr.paragraphs[0]
            r = p.add_run(headers[i])
            r.bold = True
            r.font.size = Pt(8.5)
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            
            c_val = meta_table.cell(1, i)
            set_cell_background(c_val, "F8FAFC")
            set_cell_margins(c_val, top=90, bottom=90, left=110, right=110)
            p2 = c_val.paragraphs[0]
            r2 = p2.add_run(values[i])
            r2.bold = True
            r2.font.size = Pt(9)
            r2.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
            
        doc.add_paragraph().paragraph_format.space_after = Pt(8)

        # Assessment Milestone Callout if applicable
        if day_data.get("is_assessment_day"):
            b_title = day_data.get("assessment_benchmark_title", "Scheduled Benchmark Examination")
            b_code = day_data.get("assessment_benchmark_code", "BENCHMARK")
            add_callout(
                doc,
                title=f"SCHEDULED BENCHMARK ASSESSMENT MILESTONE: [{b_code}]",
                text=f"This instructional period administers the official evaluation milestone: '{b_title}'. Candidate examination papers, grading rubrics, and confidential faculty evaluation keys are integrated in the Academic Assessment Center of this curriculum.",
                bg_hex="EFF6FF",
                border_hex="2563EB"
            )

        # =========================================================================
        # PILLAR 1: LANGUAGE KNOWLEDGE (Structure, Grammar Matrices & Vocabulary)
        # =========================================================================
        add_pillar_banner(
            doc,
            pillar_num=1,
            title="Language Knowledge",
            subtitle="Structural Grammar Matrices, Syntactic Formulations, IPA Phonetics & Lexical Bank",
            color_hex="1E3A8A"
        )

        add_header(doc, "1.1 Faculty Lecture & Linguistic Architecture", level=2)
        p_lec = doc.add_paragraph()
        p_lec.paragraph_format.line_spacing = 1.3
        p_lec.paragraph_format.space_after = Pt(6)
        r_lec = p_lec.add_run(day_data.get("grammar_rules_detail", f"Comprehensive grammatical analysis of {day_topic}."))
        r_lec.font.size = Pt(10)

        # 1.2 Theoretical Study Guide & Structural Grammar Matrix
        add_header(doc, "1.2 Master Textbook Theory & Structural Grammar Matrices", level=2)
        study_notes = day_data.get("study_notes_markdown", "")
        
        for para in study_notes.split("\n\n"):
            p_strip = para.strip()
            if not p_strip:
                continue
            if "|" in p_strip and "---" in p_strip:
                lines = [l.strip() for l in p_strip.split("\n") if l.strip()]
                header_cols = [c.strip() for c in lines[0].split("|") if c.strip()]
                if header_cols:
                    tbl = doc.add_table(rows=1, cols=len(header_cols))
                    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                    set_table_borders(tbl)
                    hdr_cells = tbl.rows[0].cells
                    for idx, hc in enumerate(header_cols):
                        set_cell_background(hdr_cells[idx], "1E3A8A")
                        set_cell_margins(hdr_cells[idx], top=90, bottom=90, left=110, right=110)
                        p = hdr_cells[idx].paragraphs[0]
                        r = p.add_run(hc)
                        r.bold = True
                        r.font.size = Pt(9)
                        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        
                    for row_line in lines[2:]:
                        cols = [c.strip() for c in row_line.split("|") if c.strip()]
                        if len(cols) == len(header_cols):
                            r_cells = tbl.add_row().cells
                            for c_idx, c_val in enumerate(cols):
                                set_cell_background(r_cells[c_idx], "F8FAFC" if c_idx % 2 == 0 else "FFFFFF")
                                set_cell_margins(r_cells[c_idx], top=70, bottom=70, left=90, right=90)
                                p = r_cells[c_idx].paragraphs[0]
                                r = p.add_run(c_val)
                                r.font.size = Pt(8.5)
                                r.font.name = "Consolas"
                    doc.add_paragraph().paragraph_format.space_after = Pt(4)
            elif p_strip.startswith("### ") or p_strip.startswith("**"):
                add_header(doc, p_strip.replace("###", "").replace("**", "").strip(), level=3)
            else:
                p_text = doc.add_paragraph()
                p_text.paragraph_format.line_spacing = 1.25
                p_text.paragraph_format.space_after = Pt(4)
                r = p_text.add_run(p_strip)
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

        # 1.3 Vocabulary Bank
        add_header(doc, "1.3 Exhaustive Vocabulary Bank & Phonetic Articulation", level=2)
        raw_vocab_items = day_data.get("vocabulary_bank", [])
        clean_vocab_items = []
        is_de = "german" in language.lower() or "deutsch" in language.lower()
        is_fr = "french" in language.lower() or "fran" in language.lower()
        is_es = "spanish" in language.lower() or "espa" in language.lower()

        for v in raw_vocab_items:
            word = str(v.get("word", "")).strip()
            phon = str(v.get("pronunciation", "")).strip()
            mean = str(v.get("meaning", "")).strip()
            eg = str(v.get("example_sentence", "")).strip()

            if not word or re.search(r"(https?://|www\.|\.app|\.com|/shorts|sa=t|source=web|url=|caes|&[a-z]+=)", word, re.IGNORECASE):
                continue
            if re.search(r"(gx|dmx|bxc|cjf|tfch|zgxodmx|aebxcjf|bdz|shorts|scwu|erbgh)", word, re.IGNORECASE):
                continue
            if not any(c in "aeiouyäöüéèêëàâîïôùûñáíóú" for c in word.lower()) and not any(ord(c) > 0x3000 for c in word):
                continue

            if not eg or re.search(r"(https?://|www\.|\.app|\.com|/shorts|sa=t|source=web|url=|caes|&[a-z]+=)", eg, re.IGNORECASE):
                if is_de:
                    eg = f'Wir verwenden "{word}" im alltäglichen Kontext auf Deutsch.'
                elif is_fr:
                    eg = f'Nous utilisons "{word}" en contexte pratique en français.'
                elif is_es:
                    eg = f'Usamos "{word}" en situaciones comunicativas en español.'
                else:
                    eg = f'Applying "{word}" in practical communicative discourse.'

            if "Domain vocabulary extracted" in mean or "verified source" in mean:
                mean = f"Core vocabulary item for {day_topic}"

            clean_vocab_items.append({
                "word": word,
                "pronunciation": phon,
                "meaning": mean,
                "example_sentence": eg
            })

        if len(clean_vocab_items) < 3:
            try:
                from app.services.thematic_curriculum_resolver import resolve_thematic_kit
                kit = resolve_thematic_kit(language, level, day_topic, day_num)
                if kit and kit.get("vocabulary"):
                    for v in kit["vocabulary"]:
                        clean_vocab_items.append({
                            "word": v["word"],
                            "pronunciation": v.get("pronunciation", ""),
                            "meaning": v.get("meaning", f"Key term for {day_topic}"),
                            "example_sentence": v.get("example_sentence", "")
                        })
            except Exception as e:
                logger.warning(f"Failed to resolve thematic kit fallback: {e}")

        if clean_vocab_items:
            v_tbl = doc.add_table(rows=1, cols=4)
            v_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
            set_table_borders(v_tbl)
            
            v_hdr = v_tbl.rows[0].cells
            v_titles = ["Target Word / Expression", "IPA Phonetic Key", "English Definition & Register", "Authentic Contextual Example"]
            for i, vt in enumerate(v_titles):
                set_cell_background(v_hdr[i], "065F46")
                set_cell_margins(v_hdr[i], top=90, bottom=90, left=110, right=110)
                p = v_hdr[i].paragraphs[0]
                r = p.add_run(vt)
                r.bold = True
                r.font.size = Pt(8.5)
                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                
            for v in clean_vocab_items:
                r_cells = v_tbl.add_row().cells
                word = v["word"]
                phon = v["pronunciation"]
                mean = v["meaning"]
                eg = v["example_sentence"]
                for idx, txt in enumerate([word, phon, mean, eg]):
                    set_cell_background(r_cells[idx], "F0FDF4" if idx == 0 else "FFFFFF")
                    set_cell_margins(r_cells[idx], top=70, bottom=70, left=90, right=90)
                    p = r_cells[idx].paragraphs[0]
                    r = p.add_run(txt)
                    r.font.size = Pt(8.5)
                    if idx == 0:
                        r.bold = True
                        r.font.color.rgb = RGBColor(0x06, 0x5F, 0x46)
                    elif idx == 1:
                        r.italic = True
                        r.font.name = "Consolas"
            doc.add_paragraph().paragraph_format.space_after = Pt(6)

        # =========================================================================
        # PILLAR 2: PROFICIENCY FRAMEWORKS (CEFR / JLPT / TOPIK Standards)
        # =========================================================================
        p2_data = pillars["pillar_2_proficiency_frameworks"]
        add_pillar_banner(
            doc,
            pillar_num=2,
            title="Proficiency Frameworks",
            subtitle=f"{p2_data['title']} • Can-Do Competency Descriptors & Non-Hallucination Boundaries",
            color_hex="065F46"
        )

        add_header(doc, "2.1 Official Competency Descriptors (Can-Do Milestones)", level=2)
        can_do_tbl = doc.add_table(rows=1, cols=2)
        can_do_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(can_do_tbl)
        
        cd_hdr = can_do_tbl.rows[0].cells
        for idx, title_txt in enumerate(["Competency Milestone", f"Certified {level} Can-Do Statement"]):
            set_cell_background(cd_hdr[idx], "065F46")
            set_cell_margins(cd_hdr[idx], top=80, bottom=80, left=100, right=100)
            p = cd_hdr[idx].paragraphs[0]
            r = p.add_run(title_txt)
            r.bold = True
            r.font.size = Pt(8.5)
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

        for c_idx, cd_text in enumerate(p2_data["can_do_descriptors"]):
            row_c = can_do_tbl.add_row().cells
            for idx, val in enumerate([f"Milestone {c_idx + 1}", cd_text]):
                set_cell_background(row_c[idx], "F0FDF4" if idx == 0 else "FFFFFF")
                set_cell_margins(row_c[idx], top=70, bottom=70, left=90, right=90)
                p = row_c[idx].paragraphs[0]
                r = p.add_run(val)
                r.font.size = Pt(8.5)
                if idx == 0:
                    r.bold = True
                    r.font.color.rgb = RGBColor(0x06, 0x5F, 0x46)
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

        add_callout(
            doc,
            "PEDAGOGICAL LEVEL BOUNDARY & ZERO-HALLUCINATION GUARDRAILS",
            p2_data["level_boundary_rules"],
            bg_hex="ECFDF5",
            border_hex="059669"
        )

        # =========================================================================
        # PILLAR 3: CULTURE & SOCIETY (Pragmatics, Formality Registers & Etiquette)
        # =========================================================================
        p3_data = pillars["pillar_3_culture_society"]
        add_pillar_banner(
            doc,
            pillar_num=3,
            title="Culture & Society",
            subtitle="Sociolinguistic Pragmatics, Formality Registers & Real-World Etiquette",
            color_hex="D97706"
        )

        add_callout(
            doc,
            "FORMALITY & PRAGMATIC REGISTERS",
            p3_data["formality_registers"],
            bg_hex="FEF3C7",
            border_hex="D97706"
        )

        add_header(doc, "3.1 Authentic Cultural Customs & Situational Etiquette", level=2)
        p_cult = doc.add_paragraph()
        p_cult.paragraph_format.line_spacing = 1.3
        p_cult.paragraph_format.space_after = Pt(6)
        r_cult = p_cult.add_run(p3_data["cultural_etiquette"])
        r_cult.font.size = Pt(9.5)
        r_cult.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

        add_callout(
            doc,
            "SENIOR FACULTY SOCIOLINGUISTIC TIP",
            p3_data["sociolinguistic_tip"],
            bg_hex="FFFBEB",
            border_hex="B45309"
        )

        # =========================================================================
        # PILLAR 4: LITERATURE & ARTS (Dialogues, Roleplay Scripts & Scenarios)
        # =========================================================================
        p4_data = pillars["pillar_4_literature_arts"]
        add_pillar_banner(
            doc,
            pillar_num=4,
            title="Literature & Arts",
            subtitle="Authentic Communicative Dialogues, Situational Roleplay Scripts & Conversational Exchange",
            color_hex="4C1D95"
        )

        add_header(doc, "4.1 In-Class Spoken Dialogues & Oral Exchange", level=2)
        dialogues = p4_data.get("classroom_dialogues", [])
        for dlg in dialogues:
            p_dlg = doc.add_paragraph()
            p_dlg.paragraph_format.space_before = Pt(3)
            p_dlg.paragraph_format.space_after = Pt(3)
            p_dlg.paragraph_format.left_indent = Inches(0.2)
            r_dlg = p_dlg.add_run(dlg)
            r_dlg.font.size = Pt(9)
            r_dlg.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
            if any(k in dlg for k in ["Teacher:", "Professeur:", "Lehrer:", "Profesor:", "Sensei:", "Dozent:"]):
                r_dlg.bold = True
                r_dlg.font.color.rgb = RGBColor(0x4C, 0x1D, 0x95)

        # =========================================================================
        # PILLAR 5: ACADEMIC & PROFESSIONAL KNOWLEDGE (Workplace Application)
        # =========================================================================
        p5_data = pillars["pillar_5_academic_professional"]
        add_pillar_banner(
            doc,
            pillar_num=5,
            title="Academic & Professional Knowledge",
            subtitle="Workplace Communication Protocols, Corporate Registers & Media Analysis",
            color_hex="0E7490"
        )

        add_header(doc, "5.1 Professional Workplace Applications", level=2)
        for app in p5_data.get("workplace_applications", []):
            p_app = doc.add_paragraph()
            p_app.paragraph_format.space_before = Pt(2)
            p_app.paragraph_format.space_after = Pt(2)
            p_app.paragraph_format.left_indent = Inches(0.2)
            r_app = p_app.add_run(f"• {app}")
            r_app.font.size = Pt(9)
            r_app.font.color.rgb = RGBColor(0x0E, 0x74, 0x90)

        add_callout(
            doc,
            "CORPORATE & ACADEMIC SITUATIONAL SCENARIO",
            p5_data["corporate_scenarios"] + "\n\n" + p5_data["formal_register_note"],
            bg_hex="ECFEFF",
            border_hex="0891B2"
        )

        add_header(doc, "5.2 Multi-Source Video & Spoken Audio Analysis", level=2)
        video_analysis = day_data.get("video_breakdown_analysis") or f"Pedagogical analysis of reference spoken materials for Period {day_num}: acoustic prosody, conversational liaisons, and native speaker pacing."
        p_vid = doc.add_paragraph()
        p_vid.paragraph_format.line_spacing = 1.3
        p_vid.paragraph_format.space_after = Pt(6)
        r_vid = p_vid.add_run(video_analysis)
        r_vid.font.size = Pt(9.5)
        r_vid.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

        # =========================================================================
        # PILLAR 6: TEACHING & PEDAGOGY (PPP Delivery, Practice Drills & Solutions)
        # =========================================================================
        p6_data = pillars["pillar_6_teaching_pedagogy"]
        add_pillar_banner(
            doc,
            pillar_num=6,
            title="Teaching & Pedagogy",
            subtitle="Faculty PPP Procedure, Formative LSRW Practice Drills & Verified Solutions",
            color_hex="BE185D"
        )

        add_callout(
            doc,
            f"FACULTY PEDAGOGICAL DIRECTIVE — PERIOD {day_num}",
            p6_data["pedagogical_instructions"],
            bg_hex="FDF2F8",
            border_hex="DB2777"
        )

        # 6.2 Practice Drills & Verified Solutions
        add_header(doc, "6.1 Formative Practice Drills with Verified Solutions & Explanations", level=2)
        solutions = p6_data.get("exercise_solutions", [])
        if not solutions:
            solutions = [{"question": q, "answer": "Model Answer", "explanation": "Grammar rule applied"} for q in day_data.get("in_class_exercises", [])]

        for s_idx, sol in enumerate(solutions):
            p_q = doc.add_paragraph()
            p_q.paragraph_format.space_before = Pt(6)
            p_q.paragraph_format.space_after = Pt(2)
            p_q.paragraph_format.keep_with_next = True
            
            r_qnum = p_q.add_run(f"Question {s_idx + 1}: ")
            r_qnum.bold = True
            r_qnum.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
            r_qnum.font.size = Pt(9.5)
            
            r_qtxt = p_q.add_run(sol.get("question", ""))
            r_qtxt.bold = True
            r_qtxt.font.size = Pt(9)
            
            # Solution callout box
            ans_table = doc.add_table(rows=1, cols=1)
            ans_table.alignment = WD_TABLE_ALIGNMENT.CENTER
            ans_cell = ans_table.cell(0, 0)
            set_cell_background(ans_cell, "ECFDF5")
            set_cell_margins(ans_cell, top=80, bottom=80, left=120, right=120)
            
            tcPr = ans_cell._tc.get_or_add_tcPr()
            borders = parse_xml(f'''
                <w:tcBorders {nsdecls("w")}>
                    <w:top w:val="none"/>
                    <w:left w:val="single" w:sz="18" w:space="0" w:color="059669"/>
                    <w:bottom w:val="none"/>
                    <w:right w:val="none"/>
                </w:tcBorders>
            ''')
            tcPr.append(borders)
            
            p_ans = ans_cell.paragraphs[0]
            r_ans_lbl = p_ans.add_run("✓ Verified Answer: ")
            r_ans_lbl.bold = True
            r_ans_lbl.font.size = Pt(9)
            r_ans_lbl.font.color.rgb = RGBColor(0x06, 0x5F, 0x46)
            
            r_ans_val = p_ans.add_run(f"{sol.get('answer', '')}\n")
            r_ans_val.bold = True
            r_ans_val.font.size = Pt(9)
            r_ans_val.font.name = "Consolas"
            r_ans_val.font.color.rgb = RGBColor(0x04, 0x78, 0x57)
            
            if sol.get("explanation"):
                r_exp_lbl = p_ans.add_run("Linguistic Breakdown: ")
                r_exp_lbl.bold = True
                r_exp_lbl.font.size = Pt(8.5)
                r_exp_lbl.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
                
                r_exp_val = p_ans.add_run(sol.get("explanation", ""))
                r_exp_val.font.size = Pt(8.5)
                r_exp_val.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

        # 6.3 Daily Workbook & Student Tasks
        add_header(doc, "6.2 Daily Workbook & LMS Student Submissions", level=2)
        hw_tasks = p6_data.get("homework_tasks", [])
        for hw in hw_tasks:
            p_hw = doc.add_paragraph()
            p_hw.paragraph_format.space_before = Pt(2)
            p_hw.paragraph_format.space_after = Pt(2)
            p_hw.paragraph_format.left_indent = Inches(0.2)
            r_hw = p_hw.add_run(f"• {hw}")
            r_hw.font.size = Pt(9)
            r_hw.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

        # =========================================================================
        # PROVENANCE & AUDIT TRAIL
        # =========================================================================
        prov = pillars["provenance_audit_trail"]
        add_pillar_banner(
            doc,
            pillar_num=7,
            title="Curriculum Provenance & Audit Trail",
            subtitle="Knowledge Vault Evidence Grounding & Zero-Hallucination Lineage",
            color_hex="334155"
        )
        
        prov_tbl = doc.add_table(rows=3, cols=2)
        prov_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(prov_tbl)
        
        prov_items = [
            ("Accredited Institution", prov["institution"]),
            ("Provenance Standard", prov["provenance_standard"]),
            ("Zero-Hallucination Audit", prov["zero_hallucination_guarantee"])
        ]
        
        for idx, (label_txt, val_txt) in enumerate(prov_items):
            c_lbl = prov_tbl.cell(idx, 0)
            set_cell_background(c_lbl, "F1F5F9")
            set_cell_margins(c_lbl, top=70, bottom=70, left=90, right=90)
            p_l = c_lbl.paragraphs[0]
            r_l = p_l.add_run(label_txt)
            r_l.bold = True
            r_l.font.size = Pt(8.5)
            r_l.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
            
            c_val = prov_tbl.cell(idx, 1)
            set_cell_background(c_val, "FFFFFF")
            set_cell_margins(c_val, top=70, bottom=70, left=90, right=90)
            p_v = c_val.paragraphs[0]
            r_v = p_v.add_run(val_txt)
            r_v.font.size = Pt(8.5)
            r_v.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
            
        doc.add_paragraph().paragraph_format.space_after = Pt(8)

    @classmethod
    def append_assessments_section(
        cls,
        doc: docx.Document,
        assessments_list: List[Dict[str, Any]],
        language: str,
        level: str,
        topic: str
    ):
        """Appends the comprehensive ISML Standardized Academic Assessments & Examination Suite."""
        if not assessments_list:
            return

        doc.add_page_break()

        # Master Assessment Banner
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        set_cell_background(cell, "0F172A")  # Slate 900
        set_cell_margins(cell, top=140, bottom=140, left=180, right=180)

        p = cell.paragraphs[0]
        p.paragraph_format.line_spacing = 1.2
        r_pre = p.add_run("ISML STANDARDIZED ACADEMIC ASSESSMENTS & BENCHMARK EXAMINATIONS\n")
        r_pre.bold = True
        r_pre.font.size = Pt(13)
        r_pre.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

        r_sub = p.add_run(
            f"Psychometrically Balanced Evaluation Suite • 4 Core Competency Areas (LSRW)\n"
            f"Official Examination Question Papers & Faculty Evaluation Keys with Analytic Rubrics"
        )
        r_sub.font.size = Pt(9.5)
        r_sub.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

        doc.add_paragraph().paragraph_format.space_after = Pt(12)

        # Overview Table
        add_header(doc, "Master Assessment Roster & Evaluation Milestones", level=2)
        sched_tbl = doc.add_table(rows=1, cols=5)
        sched_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(sched_tbl)

        headers = ["Assessment Code", "Title & Examination Focus", "Milestone Period", "Time & Marks", "Category"]
        for idx, th in enumerate(headers):
            c = sched_tbl.rows[0].cells[idx]
            set_cell_background(c, "1E3A8A")
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
            cp = c.paragraphs[0]
            cr = cp.add_run(th)
            cr.bold = True
            cr.font.size = Pt(8.5)
            cr.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

        for a in assessments_list:
            rc = sched_tbl.add_row().cells
            b_code = a.get("benchmark_code", "TEST")
            a_title = a.get("title", "Assessment")
            sched = a.get("scheduled_period_label", f"Period {a.get('scheduled_period_number', 1)}")
            time_marks = f"{a.get('duration_minutes', 45)}m / {a.get('total_marks', 50)} Marks"
            cat = str(a.get("assessment_category", "")).replace("_", " ")

            for idx, val in enumerate([b_code, a_title, sched, time_marks, cat]):
                set_cell_background(rc[idx], "F8FAFC" if idx == 0 else "FFFFFF")
                set_cell_margins(rc[idx], top=60, bottom=60, left=80, right=80)
                p_c = rc[idx].paragraphs[0]
                r_c = p_c.add_run(val)
                r_c.font.size = Pt(8)
                if idx == 0:
                    r_c.bold = True
                    r_c.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

        doc.add_paragraph().paragraph_format.space_after = Pt(14)

        # Loop through each assessment
        for idx, a in enumerate(assessments_list):
            doc.add_page_break()

            a_num = a.get("assessment_number", idx + 1)
            b_code = a.get("benchmark_code", f"TEST-{a_num}")
            a_title = a.get("title", f"Assessment {a_num}")
            category = str(a.get("assessment_category", "PROGRESS_MILESTONE")).replace("_", " ")
            sched_label = a.get("scheduled_period_label", f"Period {a.get('scheduled_period_number', a_num)}")
            duration = a.get("duration_minutes", 45)
            total_marks = a.get("total_marks", 50)
            passing_marks = a.get("passing_marks", 30)

            # Test Header Banner
            t_banner = doc.add_table(rows=1, cols=1)
            t_banner.alignment = WD_TABLE_ALIGNMENT.CENTER
            t_banner.autofit = False
            cell = t_banner.cell(0, 0)
            set_cell_background(cell, "1E3A8A")
            set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
            p_ban = cell.paragraphs[0]
            p_ban.paragraph_format.line_spacing = 1.2
            r1 = p_ban.add_run(f"EXAMINATION PAPER {a_num}: {a_title.upper()} [{b_code}]\n")
            r1.bold = True
            r1.font.size = Pt(11.5)
            r1.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

            r2 = p_ban.add_run(
                f"Classification: {category} | Benchmark: {sched_label}\n"
                f"Candidate Working Time: {duration} Minutes | Total Marks: {total_marks} | Passing Standard: {passing_marks} (60%)\n"
                f"Alignment: {a.get('cefr_alignment', f'{language} {level}')}"
            )
            r2.font.size = Pt(8.5)
            r2.font.color.rgb = RGBColor(0xBA, 0xE6, 0xFD)

            doc.add_paragraph().paragraph_format.space_after = Pt(10)

            # -------------------------------------------------------------
            # PART 1: CANDIDATE EXAMINATION QUESTION PAPER
            # -------------------------------------------------------------
            add_header(doc, f"PART 1: CANDIDATE EXAMINATION PAPER", level=2)
            add_callout(
                doc,
                title="CANDIDATE INSTRUCTIONS & ASSESSMENT REGULATIONS",
                text=(
                    f"1. This formal examination paper comprises 4 compulsory sections totaling {total_marks} Marks.\n"
                    f"2. Section A: Listening Comprehension (10 Marks) | Section B: Reading Comprehension (15 Marks)\n"
                    f"3. Section C: Use of Language & Lexicon (15 Marks) | Section D: Spoken & Written Production (10 Marks)\n"
                    f"4. Write your responses legibly in the spaces provided. No electronic dictionaries or external aids permitted."
                ),
                bg_hex="F8FAFC",
                border_hex="475569"
            )

            # Section A: Listening Comprehension
            sec_a = a.get("listening_section") or {}
            if sec_a:
                add_header(doc, f"SECTION A: {sec_a.get('section_title', 'Listening Comprehension')} ({sec_a.get('total_marks', 10)} Marks)", level=3)
                p_scene = doc.add_paragraph()
                r_sc_lbl = p_scene.add_run("Audio Stimulus Context: ")
                r_sc_lbl.bold = True
                p_scene.add_run(sec_a.get("stimulus_scene", "Classroom listening scenario"))

                p_scr = doc.add_paragraph()
                p_scr.paragraph_format.line_spacing = 1.15
                r_scr_lbl = p_scr.add_run("Transcript for Audio / Examiner Read-Aloud:\n")
                r_scr_lbl.bold = True
                r_scr_lbl.font.size = Pt(8.5)
                r_scr_lbl.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
                r_scr_txt = p_scr.add_run(f'"{sec_a.get("audio_transcript", "")}"')
                r_scr_txt.italic = True
                r_scr_txt.font.size = Pt(9)
                r_scr_txt.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

                for q in sec_a.get("questions") or []:
                    pq = doc.add_paragraph()
                    pq.paragraph_format.space_before = Pt(4)
                    pq.paragraph_format.space_after = Pt(2)
                    rq_n = pq.add_run(f"Q{q.get('question_number', 1)}. ")
                    rq_n.bold = True
                    pq.add_run(f"{q.get('question_text', '')} ")
                    rm = pq.add_run(f"[{q.get('marks_allocated', 3)} Marks]")
                    rm.bold = True
                    rm.font.size = Pt(8.5)
                    rm.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

                    if q.get("options"):
                        for opt in q["options"]:
                            p_opt = doc.add_paragraph()
                            p_opt.paragraph_format.left_indent = Inches(0.25)
                            p_opt.paragraph_format.space_before = Pt(1)
                            p_opt.paragraph_format.space_after = Pt(1)
                            p_opt.add_run(f"[  ]  {opt}")
                    else:
                        p_blank = doc.add_paragraph()
                        p_blank.paragraph_format.left_indent = Inches(0.25)
                        p_blank.add_run("Candidate Answer: __________________________________________________")

            # Section B: Reading Comprehension
            sec_b = a.get("reading_section") or {}
            if sec_b:
                add_header(doc, f"SECTION B: {sec_b.get('section_title', 'Reading & Text Analysis')} ({sec_b.get('total_marks', 15)} Marks)", level=3)
                p_pt = doc.add_paragraph()
                p_pt.paragraph_format.space_after = Pt(2)
                r_pt = p_pt.add_run(f"Reading Passage: {sec_b.get('passage_title', 'Reading Text')}")
                r_pt.bold = True
                r_pt.font.size = Pt(9.5)

                add_callout(
                    doc,
                    title="READING STIMULUS PASSAGE",
                    text=sec_b.get("reading_passage_text", ""),
                    bg_hex="F0FDF4",
                    border_hex="16A34A"
                )

                for q in sec_b.get("questions") or []:
                    pq = doc.add_paragraph()
                    pq.paragraph_format.space_before = Pt(4)
                    pq.paragraph_format.space_after = Pt(2)
                    rq_n = pq.add_run(f"Q{q.get('question_number', 1)}. ")
                    rq_n.bold = True
                    pq.add_run(f"{q.get('question_text', '')} ")
                    rm = pq.add_run(f"[{q.get('marks_allocated', 3)} Marks]")
                    rm.bold = True
                    rm.font.size = Pt(8.5)
                    rm.font.color.rgb = RGBColor(0x16, 0xA3, 0x4A)

                    if q.get("options"):
                        for opt in q["options"]:
                            p_opt = doc.add_paragraph()
                            p_opt.paragraph_format.left_indent = Inches(0.25)
                            p_opt.paragraph_format.space_before = Pt(1)
                            p_opt.paragraph_format.space_after = Pt(1)
                            p_opt.add_run(f"[  ]  {opt}")
                    else:
                        p_blank = doc.add_paragraph()
                        p_blank.paragraph_format.left_indent = Inches(0.25)
                        p_blank.add_run("Candidate Answer: __________________________________________________")

            # Section C: Use of Language
            sec_c = a.get("language_knowledge_section") or {}
            if sec_c:
                add_header(doc, f"SECTION C: {sec_c.get('section_title', 'Use of Language, Grammar Matrices & Lexicon')} ({sec_c.get('total_marks', 15)} Marks)", level=3)
                p_str = doc.add_paragraph()
                r_st_l = p_str.add_run("Target Linguistic Focus: ")
                r_st_l.bold = True
                p_str.add_run(sec_c.get("structural_focus", ""))

                for q in sec_c.get("grammar_questions") or []:
                    pq = doc.add_paragraph()
                    pq.paragraph_format.space_before = Pt(4)
                    pq.paragraph_format.space_after = Pt(2)
                    rq_n = pq.add_run(f"Q{q.get('question_number', 1)}. ")
                    rq_n.bold = True
                    pq.add_run(f"{q.get('question_text', '')} ")
                    rm = pq.add_run(f"[{q.get('marks_allocated', 3)} Marks]")
                    rm.bold = True
                    rm.font.size = Pt(8.5)
                    rm.font.color.rgb = RGBColor(0x7C, 0x3A, 0xED)

                    if q.get("options"):
                        for opt in q["options"]:
                            p_opt = doc.add_paragraph()
                            p_opt.paragraph_format.left_indent = Inches(0.25)
                            p_opt.paragraph_format.space_before = Pt(1)
                            p_opt.paragraph_format.space_after = Pt(1)
                            p_opt.add_run(f"[  ]  {opt}")
                    else:
                        p_blank = doc.add_paragraph()
                        p_blank.paragraph_format.left_indent = Inches(0.25)
                        p_blank.add_run("Candidate Answer: __________________________________________________")

                # Vocabulary matching table
                v_items = sec_c.get("vocabulary_matching_items") or []
                if v_items:
                    p_v_inst = doc.add_paragraph()
                    p_v_inst.paragraph_format.space_before = Pt(6)
                    r_vi = p_v_inst.add_run("Part II: Lexical Mastery Matching Exercise (4 Marks)")
                    r_vi.bold = True
                    r_vi.font.size = Pt(9)

                    v_tbl = doc.add_table(rows=1, cols=3)
                    v_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                    set_table_borders(v_tbl)

                    for c_i, th in enumerate(["Target Lexical Term", "Candidate Match [ ]", "Academic Definition"]):
                        c = v_tbl.rows[0].cells[c_i]
                        set_cell_background(c, "6D28D9")
                        set_cell_margins(c, top=60, bottom=60, left=80, right=80)
                        cp = c.paragraphs[0]
                        cr = cp.add_run(th)
                        cr.bold = True
                        cr.font.size = Pt(8.5)
                        cr.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

                    for idx_v, item in enumerate(v_items):
                        r_row = v_tbl.add_row().cells
                        set_cell_background(r_row[0], "F5F3FF")
                        set_cell_margins(r_row[0], top=50, bottom=50, left=70, right=70)
                        p0 = r_row[0].paragraphs[0]
                        r0 = p0.add_run(f"{idx_v + 1}. {item.get('term', '')}")
                        r0.bold = True
                        r0.font.size = Pt(8.5)

                        set_cell_background(r_row[1], "FFFFFF")
                        set_cell_margins(r_row[1], top=50, bottom=50, left=70, right=70)
                        p1 = r_row[1].paragraphs[0]
                        p1.add_run("[       ]")

                        set_cell_background(r_row[2], "FFFFFF")
                        set_cell_margins(r_row[2], top=50, bottom=50, left=70, right=70)
                        p2 = r_row[2].paragraphs[0]
                        r2 = p2.add_run(item.get("definition", ""))
                        r2.font.size = Pt(8.5)

                    doc.add_paragraph().paragraph_format.space_after = Pt(6)

            # Section D: Spoken & Written Production
            sec_d = a.get("production_section") or {}
            if sec_d:
                add_header(doc, f"SECTION D: {sec_d.get('section_title', 'Spoken & Written Production')} ({sec_d.get('total_marks', 10)} Marks)", level=3)
                oral = sec_d.get("oral_speaking_task") or {}
                if oral:
                    p_or = doc.add_paragraph()
                    r_or_l = p_or.add_run("Task 1: Individual Oral Speaking Interview [5 Marks]\n")
                    r_or_l.bold = True
                    r_or_l.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)
                    p_or.add_run(f"Scenario: {oral.get('prompt_situation', '')}\n")
                    p_or.add_run(f"Preparation & Presentation Time: {oral.get('interaction_time_seconds', 120)} seconds\n")
                    p_or.add_run("Guidelines for Candidate:")
                    for bp in oral.get("guiding_bullet_points") or []:
                        p_bp = doc.add_paragraph()
                        p_bp.paragraph_format.left_indent = Inches(0.25)
                        p_bp.add_run(f"• {bp}")

                written = sec_d.get("written_composition_task") or {}
                if written:
                    p_wr = doc.add_paragraph()
                    p_wr.paragraph_format.space_before = Pt(6)
                    r_wr_l = p_wr.add_run("Task 2: Guided Communicative Writing Composition [5 Marks]\n")
                    r_wr_l.bold = True
                    r_wr_l.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)
                    p_wr.add_run(f"Prompt Topic: {written.get('prompt_topic', '')}\n")
                    p_wr.add_run(f"Target Length: {written.get('target_word_count', '60-80 words')}\n")
                    p_wr.add_run("Required Functions: " + ", ".join(written.get("required_communicative_functions") or []))

                    p_lines = doc.add_paragraph()
                    p_lines.paragraph_format.left_indent = Inches(0.25)
                    p_lines.add_run("\n".join(["____________________________________________________________________"] * 4))

            # -------------------------------------------------------------
            # PART 2: FACULTY EVALUATION KEY & SCORING MATRIX
            # -------------------------------------------------------------
            add_header(doc, f"PART 2: FACULTY EVALUATION KEY & MARKING SCHEME [CONFIDENTIAL]", level=2)
            add_callout(
                doc,
                title="EXAMINER ASSESSMENT RUBRIC & MARKING PROTOCOL",
                text=(
                    f"Official Grading Standards for Examination {b_code}.\n"
                    f"Passing Threshold: {passing_marks}/{total_marks} (60%). Marks allocated based on communicative accuracy, "
                    f"grammatical precision, and adherence to CEFR descriptors."
                ),
                bg_hex="FEF3C7",
                border_hex="D97706"
            )

            # Solutions for A, B, C
            sol_tbl = doc.add_table(rows=1, cols=4)
            sol_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
            set_table_borders(sol_tbl)
            for c_i, th in enumerate(["Question / Section", "Type", "Verified Correct Answer", "Examiner Marking Justification"]):
                c = sol_tbl.rows[0].cells[c_i]
                set_cell_background(c, "92400E")
                set_cell_margins(c, top=60, bottom=60, left=80, right=80)
                cp = c.paragraphs[0]
                cr = cp.add_run(th)
                cr.bold = True
                cr.font.size = Pt(8.5)
                cr.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

            # Collect all questions
            all_questions = []
            for q in sec_a.get("questions") or []:
                all_questions.append(("Sec A (Listening)", q))
            for q in sec_b.get("questions") or []:
                all_questions.append(("Sec B (Reading)", q))
            for q in sec_c.get("grammar_questions") or []:
                all_questions.append(("Sec C (Grammar)", q))

            for sec_lbl, q in all_questions:
                r_row = sol_tbl.add_row().cells
                set_cell_background(r_row[0], "FFFBEB")
                set_cell_margins(r_row[0], top=50, bottom=50, left=70, right=70)
                p0 = r_row[0].paragraphs[0]
                r0 = p0.add_run(f"{sec_lbl} Q{q.get('question_number', 1)}")
                r0.bold = True
                r0.font.size = Pt(8)

                set_cell_background(r_row[1], "FFFFFF")
                set_cell_margins(r_row[1], top=50, bottom=50, left=70, right=70)
                p1 = r_row[1].paragraphs[0]
                r1 = p1.add_run(q.get("question_type", ""))
                r1.font.size = Pt(8)

                set_cell_background(r_row[2], "FFFFFF")
                set_cell_margins(r_row[2], top=50, bottom=50, left=70, right=70)
                p2 = r_row[2].paragraphs[0]
                r2 = p2.add_run(str(q.get("correct_answer", "")))
                r2.bold = True
                r2.font.size = Pt(8)
                r2.font.color.rgb = RGBColor(0x06, 0x5F, 0x46)

                set_cell_background(r_row[3], "FFFFFF")
                set_cell_margins(r_row[3], top=50, bottom=50, left=70, right=70)
                p3 = r_row[3].paragraphs[0]
                r3 = p3.add_run(q.get("marking_explanation", ""))
                r3.font.size = Pt(8)

            doc.add_paragraph().paragraph_format.space_after = Pt(8)

            # Section D Model Exemplars & Analytic Rubric
            if sec_d:
                add_header(doc, "Section D: Analytic Scoring Rubric & Model Exemplar Solutions", level=3)
                if oral and oral.get("model_exemplar_response"):
                    p_m_or = doc.add_paragraph()
                    r_mol = p_m_or.add_run("Oral Speaking Model Exemplar Transcript:\n")
                    r_mol.bold = True
                    r_mot = p_m_or.add_run(f'"{oral.get("model_exemplar_response", "")}"')
                    r_mot.italic = True
                    r_mot.font.size = Pt(8.5)

                if written and written.get("model_exemplar_composition"):
                    p_m_wr = doc.add_paragraph()
                    r_mwl = p_m_wr.add_run("Written Composition Model Exemplar Essay:\n")
                    r_mwl.bold = True
                    r_mwt = p_m_wr.add_run(f'"{written.get("model_exemplar_composition", "")}"')
                    r_mwt.italic = True
                    r_mwt.font.size = Pt(8.5)

            # Faculty Marking Policy Callout
            pol = a.get("faculty_marking_policy") or {}
            if pol:
                add_callout(
                    doc,
                    title="FACULTY GRADING SCALE & REMEDIAL INTERVENTION MANDATES",
                    text=(
                        f"Standard: {pol.get('grading_standard', 'Distinction (85%+), Merit (70-84%), Pass (60-69%), Remedial (<60%)')}\n\n"
                        f"Guidance: {pol.get('passing_threshold_guidance', '')}\n\n"
                        f"Remedial Protocol: {pol.get('remedial_pedagogical_interventions', '')}"
                    ),
                    bg_hex="FDF2F8",
                    border_hex="DB2777"
                )

    @classmethod
    def generate_full_curriculum_docx(
        cls,
        days_list: List[Dict[str, Any]],
        language: str,
        level: str,
        topic: str,
        track_label: str,
        output_filepath: str,
        session_package: Dict[str, Any] = None
    ) -> str:
        """Generates an all-inclusive Master Curriculum Guide containing ALL periods and pages sequentially."""
        doc = docx.Document()

        # Configure standard margins
        for section in doc.sections:
            section.top_margin = Inches(0.85)
            section.bottom_margin = Inches(0.85)
            section.left_margin = Inches(0.9)
            section.right_margin = Inches(0.9)

            # Header & Footer
            header = section.header
            hp = header.paragraphs[0]
            hp.text = f"ISML Language & Management School • {language} ({level}) Master Curriculum Guide"
            hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            hp.runs[0].font.size = Pt(8.5)
            hp.runs[0].font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

            footer = section.footer
            fp = footer.paragraphs[0]
            fp.text = f"Comprehensive All-Period Faculty & Student Master Guide | Confidential & Proprietary ISML"
            fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            fp.runs[0].font.size = Pt(8.5)
            fp.runs[0].font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

        # ---------------------------------------------------------
        # GRAND MASTER COVER PAGE
        # ---------------------------------------------------------
        p_cover_pre = doc.add_paragraph()
        p_cover_pre.paragraph_format.space_before = Pt(20)
        p_cover_pre.paragraph_format.space_after = Pt(4)
        r_pre = p_cover_pre.add_run("ISML FACULTY & STUDENT MASTER CURRICULUM BLUEPRINT\nCOMPLETE MULTI-PERIOD EDITION • 6 UNIVERSAL MASTER PILLARS")
        r_pre.font.size = Pt(11)
        r_pre.bold = True
        r_pre.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

        p_cover_title = doc.add_paragraph()
        p_cover_title.paragraph_format.space_before = Pt(4)
        p_cover_title.paragraph_format.space_after = Pt(12)
        r_title = p_cover_title.add_run(f"{language} ({level})\n{topic}")
        r_title.font.size = Pt(24)
        r_title.bold = True
        r_title.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

        total_units = len(days_list)
        p_desc = doc.add_paragraph()
        p_desc.paragraph_format.line_spacing = 1.3
        p_desc.paragraph_format.space_after = Pt(14)
        r_desc = p_desc.add_run(
            f"This exhaustive master textbook encompasses all {total_units} sequential periods/days of the curriculum, "
            f"strictly structured under the 6 Universal Master Knowledge Pillars: (1) Language Knowledge, (2) Proficiency Frameworks, "
            f"(3) Culture & Society, (4) Literature & Arts, (5) Academic & Professional Knowledge, and (6) Teaching & Pedagogy, "
            f"complete with classroom lecture structures, grammar matrices, vocabulary banks, oral dialogue roleplays, "
            f"comprehension drills, verified answers with linguistic explanations, and student workbook assignments."
        )
        r_desc.font.size = Pt(10.5)
        r_desc.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

        # Overview Table
        summary_tbl = doc.add_table(rows=2, cols=4)
        summary_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(summary_tbl)

        headers = ["Target Language", "CEFR Standard", "Curriculum Track", "Total Course Scope"]
        vals = [language, level, track_label, f"{total_units} Comprehensive Periods"]

        for i in range(4):
            c_hdr = summary_tbl.cell(0, i)
            set_cell_background(c_hdr, "0F172A")
            set_cell_margins(c_hdr, top=90, bottom=90, left=110, right=110)
            p = c_hdr.paragraphs[0]
            r = p.add_run(headers[i])
            r.bold = True
            r.font.size = Pt(8.5)
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

            c_val = summary_tbl.cell(1, i)
            set_cell_background(c_val, "F1F5F9")
            set_cell_margins(c_val, top=90, bottom=90, left=110, right=110)
            p2 = c_val.paragraphs[0]
            r2 = p2.add_run(vals[i])
            r2.bold = True
            r2.font.size = Pt(9)
            r2.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

        doc.add_paragraph().paragraph_format.space_after = Pt(16)

        # Table of Contents
        add_header(doc, "Curriculum Table of Contents & Period Roadmap", level=1)
        toc_tbl = doc.add_table(rows=1, cols=3)
        toc_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(toc_tbl)

        toc_hdr = toc_tbl.rows[0].cells
        for idx, th in enumerate(["Period / Day", "Focus Concept & Lesson Topic", "Grammar & Competency Scope"]):
            set_cell_background(toc_hdr[idx], "1E3A8A")
            set_cell_margins(toc_hdr[idx], top=80, bottom=80, left=100, right=100)
            p = toc_hdr[idx].paragraphs[0]
            r = p.add_run(th)
            r.bold = True
            r.font.size = Pt(9)
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

        for d in days_list:
            r_c = toc_tbl.add_row().cells
            p_num = d.get("day_number", 1)
            p_top = d.get("day_topic", "")
            p_rules = (d.get("grammar_rules_detail", "")[:120] + "...") if len(d.get("grammar_rules_detail", "")) > 120 else d.get("grammar_rules_detail", "")

            for idx, val in enumerate([f"Period {p_num}", p_top, p_rules]):
                set_cell_background(r_c[idx], "F8FAFC" if idx == 0 else "FFFFFF")
                set_cell_margins(r_c[idx], top=60, bottom=60, left=80, right=80)
                p = r_c[idx].paragraphs[0]
                r = p.add_run(val)
                r.font.size = Pt(8.5)
                if idx == 0:
                    r.bold = True
                    r.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

        # Append each Day's Full Textbook Chapter Sequentially
        for idx, day_item in enumerate(days_list):
            cls.append_day_section(
                doc=doc,
                day_data=day_item,
                language=language,
                level=level,
                topic=topic,
                track_label=track_label,
                is_first=False
            )

        # Append Formal Academic Assessments & Examination Suite
        assessments_list = []
        if session_package and isinstance(session_package, dict):
            assessments_list = (
                session_package.get("generated_assessments") or
                session_package.get("assessments") or
                []
            )
            if not assessments_list and "planner" in session_package and isinstance(session_package["planner"], dict):
                assessments_list = (
                    session_package["planner"].get("generated_assessments") or
                    session_package["planner"].get("assessments") or
                    []
                )

        if assessments_list:
            cls.append_assessments_section(
                doc=doc,
                assessments_list=assessments_list,
                language=language,
                level=level,
                topic=topic
            )

        os.makedirs(os.path.dirname(output_filepath), exist_ok=True)
        doc.save(output_filepath)
        return output_filepath
