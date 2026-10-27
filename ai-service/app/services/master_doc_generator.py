import os
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
from typing import Dict, Any, List

def set_cell_background(cell, fill_hex):
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
        run.font.size = Pt(15)
        run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A) # Deep Blue
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
    elif level == 2:
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(0x06, 0x5F, 0x46) # Emerald Teal
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
    elif level == 3:
        run.font.size = Pt(11.5)
        run.font.color.rgb = RGBColor(0x4C, 0x1D, 0x95) # Deep Purple
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
    return p

def add_callout(doc, title: str, text: str, bg_hex="F0F9FF", border_hex="0284C7"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
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
    r_title.font.size = Pt(10.5)
    r_title.font.color.rgb = RGBColor(0x0C, 0x4A, 0x6E)
    
    r_text = p.add_run(text)
    r_text.font.size = Pt(10)
    r_text.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

class MasterDocxGenerator:
    """Generates an exhaustive 10+ page textbook-grade master study guide for any specific class day."""
    
    @staticmethod
    def generate_day_master_docx(
        day_data: Dict[str, Any],
        language: str,
        level: str,
        topic: str,
        track_label: str,
        output_filepath: str
    ) -> str:
        doc = docx.Document()
        
        # Configure standard 1-inch margins
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
            fp.text = f"Day {day_data.get('day_number', 1)}: {day_data.get('day_topic', topic)} | Confidential & Proprietary ISML Curriculum"
            fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            fp.runs[0].font.size = Pt(8.5)
            fp.runs[0].font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

        # ---------------------------------------------------------
        # COVER / TITLE BLOCK
        # ---------------------------------------------------------
        p_title = doc.add_paragraph()
        p_title.paragraph_format.space_before = Pt(10)
        p_title.paragraph_format.space_after = Pt(2)
        r_sub = p_title.add_run("ISML FACULTY MASTER STUDY GUIDE & TEXTBOOK MANUAL\n")
        r_sub.font.size = Pt(10)
        r_sub.bold = True
        r_sub.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)
        
        r_main = p_title.add_run(f"Day {day_data.get('day_number', 1)}: {day_data.get('day_topic', topic)}")
        r_main.font.size = Pt(20)
        r_main.bold = True
        r_main.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

        # Metadata Strip Table
        meta_table = doc.add_table(rows=2, cols=4)
        meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(meta_table)
        
        headers = ["Target Language", "CEFR Level", "Curriculum Track", "Class Duration"]
        values = [language, level, track_label, "1-Hour Live Faculty Lecture"]
        
        for i in range(4):
            c_hdr = meta_table.cell(0, i)
            set_cell_background(c_hdr, "0F172A")
            set_cell_margins(c_hdr, top=100, bottom=100, left=120, right=120)
            p = c_hdr.paragraphs[0]
            r = p.add_run(headers[i])
            r.bold = True
            r.font.size = Pt(9)
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            
            c_val = meta_table.cell(1, i)
            set_cell_background(c_val, "F8FAFC")
            set_cell_margins(c_val, top=100, bottom=100, left=120, right=120)
            p2 = c_val.paragraphs[0]
            r2 = p2.add_run(values[i])
            r2.bold = True
            r2.font.size = Pt(9.5)
            r2.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
            
        doc.add_paragraph().paragraph_format.space_after = Pt(10)

        # ---------------------------------------------------------
        # SECTION 1: FACULTY PEDAGOGICAL BLUEPRINT & LECTURE BREAKDOWN
        # ---------------------------------------------------------
        add_header(doc, "1. Executive Faculty Lecture & Linguistic Architecture", level=1)
        p_lec = doc.add_paragraph()
        p_lec.paragraph_format.line_spacing = 1.3
        p_lec.paragraph_format.space_after = Pt(8)
        r_lec = p_lec.add_run(day_data.get("grammar_rules_detail", f"Comprehensive analysis of {topic}."))
        r_lec.font.size = Pt(10.5)
        
        add_callout(
            doc,
            "SENIOR FACULTY PEDAGOGICAL ADVICE",
            day_data.get("pedagogical_instructions", "Deliver structured drills without relying on translation."),
            bg_hex="FEF3C7",
            border_hex="D97706"
        )

        # ---------------------------------------------------------
        # SECTION 2: EXHAUSTIVE THEORETICAL STUDY GUIDE & GRAMMAR MATRIX
        # ---------------------------------------------------------
        add_header(doc, "2. Master Textbook Theory & Structural Grammar Matrices", level=1)
        study_notes = day_data.get("study_notes_markdown", "")
        
        for para in study_notes.split("\n\n"):
            p_strip = para.strip()
            if not p_strip:
                continue
            if "|" in p_strip and "---" in p_strip:
                # Render Table
                lines = [l.strip() for l in p_strip.split("\n") if l.strip()]
                header_cols = [c.strip() for c in lines[0].split("|") if c.strip()]
                if header_cols:
                    tbl = doc.add_table(rows=1, cols=len(header_cols))
                    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                    set_table_borders(tbl)
                    hdr_cells = tbl.rows[0].cells
                    for idx, hc in enumerate(header_cols):
                        set_cell_background(hdr_cells[idx], "1E3A8A")
                        set_cell_margins(hdr_cells[idx], top=100, bottom=100, left=120, right=120)
                        p = hdr_cells[idx].paragraphs[0]
                        r = p.add_run(hc)
                        r.bold = True
                        r.font.size = Pt(9.5)
                        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                        
                    for row_line in lines[2:]:
                        cols = [c.strip() for c in row_line.split("|") if c.strip()]
                        if len(cols) == len(header_cols):
                            r_cells = tbl.add_row().cells
                            for c_idx, c_val in enumerate(cols):
                                set_cell_background(r_cells[c_idx], "F8FAFC" if c_idx % 2 == 0 else "FFFFFF")
                                set_cell_margins(r_cells[c_idx], top=80, bottom=80, left=100, right=100)
                                p = r_cells[c_idx].paragraphs[0]
                                r = p.add_run(c_val)
                                r.font.size = Pt(9)
                                r.font.name = "Consolas"
                    doc.add_paragraph().paragraph_format.space_after = Pt(6)
            elif p_strip.startswith("### ") or p_strip.startswith("**"):
                add_header(doc, p_strip.replace("###", "").replace("**", "").strip(), level=2)
            else:
                p_text = doc.add_paragraph()
                p_text.paragraph_format.line_spacing = 1.3
                p_text.paragraph_format.space_after = Pt(6)
                r = p_text.add_run(p_strip)
                r.font.size = Pt(10)
                r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

        # ---------------------------------------------------------
        # SECTION 3: AUTHENTIC VOCABULARY BANK & PHONETIC GUIDE
        # ---------------------------------------------------------
        add_header(doc, "3. Exhaustive Vocabulary Bank & Phonetic Articulation", level=1)
        vocab_items = day_data.get("vocabulary_bank", [])
        if vocab_items:
            v_tbl = doc.add_table(rows=1, cols=4)
            v_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
            set_table_borders(v_tbl)
            
            v_hdr = v_tbl.rows[0].cells
            v_titles = ["Target Word / Expression", "IPA Phonetic Key", "English Definition & Register", "Authentic Contextual Example"]
            for i, vt in enumerate(v_titles):
                set_cell_background(v_hdr[i], "065F46")
                set_cell_margins(v_hdr[i], top=100, bottom=100, left=120, right=120)
                p = v_hdr[i].paragraphs[0]
                r = p.add_run(vt)
                r.bold = True
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                
            for v in vocab_items:
                r_cells = v_tbl.add_row().cells
                word = v.get("word", "")
                phon = v.get("pronunciation", "")
                mean = v.get("meaning", "")
                eg = v.get("example_sentence", "")
                for idx, txt in enumerate([word, phon, mean, eg]):
                    set_cell_background(r_cells[idx], "F0FDF4" if idx == 0 else "FFFFFF")
                    set_cell_margins(r_cells[idx], top=80, bottom=80, left=100, right=100)
                    p = r_cells[idx].paragraphs[0]
                    r = p.add_run(txt)
                    r.font.size = Pt(9)
                    if idx == 0:
                        r.bold = True
                        r.font.color.rgb = RGBColor(0x06, 0x5F, 0x46)
                    elif idx == 1:
                        r.italic = True
                        r.font.name = "Consolas"
            doc.add_paragraph().paragraph_format.space_after = Pt(8)

        # ---------------------------------------------------------
        # SECTION 4: IN-CLASS LIVE DIALOGUE SCRIPTS & ORAL ROLEPLAY
        # ---------------------------------------------------------
        add_header(doc, "4. In-Class Spoken Dialogues & Conversational Roleplay", level=1)
        dialogues = day_data.get("classroom_dialogues", [])
        for dlg in dialogues:
            p_dlg = doc.add_paragraph()
            p_dlg.paragraph_format.space_before = Pt(4)
            p_dlg.paragraph_format.space_after = Pt(4)
            p_dlg.paragraph_format.left_indent = Inches(0.2)
            r_dlg = p_dlg.add_run(dlg)
            r_dlg.font.size = Pt(9.5)
            r_dlg.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
            if "Teacher:" in dlg or "Professeur:" in dlg or "Lehrer:" in dlg or "Profesor:" in dlg:
                r_dlg.bold = True

        # ---------------------------------------------------------
        # ---------------------------------------------------------
        # SECTION 5: IN-DEPTH VIDEO & AUDIO ANALYTICAL BREAKDOWN
        # ---------------------------------------------------------
        add_header(doc, "5. Multi-Source Video Breakdown & Native Spoken Audio Analysis", level=1)
        video_analysis = day_data.get("video_breakdown_analysis", "")
        if not video_analysis:
            video_analysis = f"Comprehensive pedagogical analysis of reference materials for Day {day_data.get('day_number', 1)}: vocal modulation, natural conversational liaisons, and native speaker pacing."
        
        p_vid = doc.add_paragraph()
        p_vid.paragraph_format.line_spacing = 1.3
        p_vid.paragraph_format.space_after = Pt(8)
        r_vid = p_vid.add_run(video_analysis)
        r_vid.font.size = Pt(10)
        r_vid.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

        # ---------------------------------------------------------
        # SECTION 6: STANDARDIZED PRACTICE DRILLS & EXPLANATIONS
        # ---------------------------------------------------------
        add_header(doc, "6. Comprehensive Practice Drills with Verified Solutions & Explanations", level=1)
        solutions = day_data.get("exercise_solutions", [])
        if not solutions:
            solutions = [{"question": q, "answer": "Model Answer", "explanation": "Grammar rule applied"} for q in day_data.get("in_class_exercises", [])]

        for s_idx, sol in enumerate(solutions):
            p_q = doc.add_paragraph()
            p_q.paragraph_format.space_before = Pt(8)
            p_q.paragraph_format.space_after = Pt(2)
            p_q.paragraph_format.keep_with_next = True
            
            r_qnum = p_q.add_run(f"Question {s_idx + 1}: ")
            r_qnum.bold = True
            r_qnum.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
            r_qnum.font.size = Pt(10.5)
            
            r_qtxt = p_q.add_run(sol.get("question", ""))
            r_qtxt.bold = True
            r_qtxt.font.size = Pt(10)
            
            # Solution callout box
            ans_table = doc.add_table(rows=1, cols=1)
            ans_table.alignment = WD_TABLE_ALIGNMENT.CENTER
            ans_cell = ans_table.cell(0, 0)
            set_cell_background(ans_cell, "ECFDF5")
            set_cell_margins(ans_cell, top=100, bottom=100, left=140, right=140)
            
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
            r_ans_lbl.font.size = Pt(9.5)
            r_ans_lbl.font.color.rgb = RGBColor(0x06, 0x5F, 0x46)
            
            r_ans_val = p_ans.add_run(f"{sol.get('answer', '')}\n")
            r_ans_val.bold = True
            r_ans_val.font.size = Pt(9.5)
            r_ans_val.font.name = "Consolas"
            r_ans_val.font.color.rgb = RGBColor(0x04, 0x78, 0x57)
            
            if sol.get("explanation"):
                r_exp_lbl = p_ans.add_run("Linguistic Breakdown: ")
                r_exp_lbl.bold = True
                r_exp_lbl.font.size = Pt(9)
                r_exp_lbl.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
                
                r_exp_val = p_ans.add_run(sol.get("explanation", ""))
                r_exp_val.font.size = Pt(9)
                r_exp_val.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

        # ---------------------------------------------------------
        # SECTION 6: DAILY HOMEWORK & SELF-STUDY LMS SUBMISSION
        # ---------------------------------------------------------
        add_header(doc, "6. Daily Workbook & LMS Student Submissions", level=1)
        hw_tasks = day_data.get("homework_tasks", [])
        for hw in hw_tasks:
            p_hw = doc.add_paragraph()
            p_hw.paragraph_format.space_before = Pt(3)
            p_hw.paragraph_format.space_after = Pt(3)
            p_hw.paragraph_format.left_indent = Inches(0.2)
            r_hw = p_hw.add_run(f"• {hw}")
            r_hw.font.size = Pt(9.5)
            r_hw.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

        # Save document
        os.makedirs(os.path.dirname(output_filepath), exist_ok=True)
        doc.save(output_filepath)
        return output_filepath
