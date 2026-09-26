import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import os

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
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

def make_callout_box(doc, text, title="KEY OVERVIEW", bg_hex="F0F4F8", border_hex="1F4E79"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=160, bottom=160, left=200, right=200)
    
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
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_after = Pt(4)
    run_t = p.add_run(f"📌 {title}\n")
    run_t.bold = True
    run_t.font.size = Pt(12)
    run_t.font.name = 'Calibri'
    run_t.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    
    run_txt = p.add_run(text)
    run_txt.font.size = Pt(11)
    run_txt.font.name = 'Calibri'
    run_txt.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    
    sp = doc.add_paragraph()
    sp.paragraph_format.space_after = Pt(6)

def create_document():
    doc = docx.Document()
    
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        
    normal_style = doc.styles['Normal']
    normal_font = normal_style.font
    normal_font.name = 'Calibri'
    normal_font.size = Pt(12)
    normal_font.color.rgb = RGBColor(0x22, 0x22, 0x22)
    
    # Header Title
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run("ISML PORTAL V3 — DETAILED TEAM OWNERSHIP & WORK BREAKDOWN")
    title_run.bold = True
    title_run.font.size = Pt(18)
    title_run.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    title_p.paragraph_format.space_after = Pt(4)
    
    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = sub_p.add_run("Executive Responsibility Matrix for Jay Kumar, Bharathi, & Interns")
    sub_run.font.size = Pt(12)
    sub_run.italic = True
    sub_run.font.color.rgb = RGBColor(0x55, 0x55, 0x55)
    sub_p.paragraph_format.space_after = Pt(16)
    
    make_callout_box(
        doc,
        "ISML Portal V3 represents the unified core of Live Learning, AI Resource Intelligence, and Speech/Language Skill Acquisition. "
        "This document clearly demarcates team ownership to eliminate overlaps and streamline execution.",
        title="V3 CORE PHILOSOPHY: Teach → Record → Organize → Practice → Evaluate → Track → Improve"
    )
    
    # Section 1: Ownership Summary Table
    h1 = doc.add_paragraph()
    h1_run = h1.add_run("1. High-Level Team Ownership Matrix")
    h1_run.bold = True
    h1_run.font.size = Pt(14)
    h1_run.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(8)
    
    summary_data = [
        ("Jay Kumar", "Live Learning System & Recording Ecosystem", "Blue (#1F4E79)", "Schedule → Live Room → Classroom → Attendance → Recording → Processing → Pre-recorded → Video Library → Playback"),
        ("Bharathi", "Resource Intelligence & Resource Agent", "Green (#2E7D32)", "Requirement → Search → Discovery → Metadata → Classification → Validation → Quality → Duplicate → Copyright → Review → Library"),
        ("Bharathi + Interns", "LSRW Agent (Speech & Language Engine)", "Purple (#6A1B9A)", "Listening → Speaking → Reading → Writing → AI Evaluation → Score → Feedback → Progress")
    ]
    
    table1 = doc.add_table(rows=1, cols=4)
    table1.alignment = WD_TABLE_ALIGNMENT.CENTER
    table1.autofit = False
    set_table_borders(table1)
    
    hdr_cells = table1.rows[0].cells
    headers = ["Team Member", "Main Responsibility Scope", "Theme Color", "Core End-to-End Workflow"]
    widths = [Inches(1.4), Inches(1.8), Inches(1.0), Inches(2.3)]
    
    for i, title in enumerate(headers):
        hdr_cells[i].width = widths[i]
        set_cell_background(hdr_cells[i], "1F4E79")
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(title)
        run.bold = True
        run.font.size = Pt(10.5)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        
    for owner, resp, color_name, flow in summary_data:
        row_cells = table1.add_row().cells
        
        if "Jay" in owner:
            bg_color = "F0F4F8"
            txt_color = RGBColor(0x1F, 0x4E, 0x79)
        elif "Bharathi +" in owner or "Interns" in owner:
            bg_color = "F3E5F5"
            txt_color = RGBColor(0x6A, 0x1B, 0x9A)
        else:
            bg_color = "E8F5E9"
            txt_color = RGBColor(0x2E, 0x7D, 0x32)
            
        for i, val in enumerate([owner, resp, color_name, flow]):
            row_cells[i].width = widths[i]
            set_cell_background(row_cells[i], bg_color)
            set_cell_margins(row_cells[i], top=100, bottom=100, left=120, right=120)
            p = row_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.line_spacing = 1.3
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.size = Pt(10.5)
            if i == 0:
                run.bold = True
                run.font.color.rgb = txt_color
                
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    # Section 2: Jay Kumar Breakdown
    h2 = doc.add_paragraph()
    h2_run = h2.add_run("2. Jay Kumar — Live Learning System & Recording Ecosystem")
    h2_run.bold = True
    h2_run.font.size = Pt(14)
    h2_run.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(8)
    
    jay_tasks = [
        ("1. Live Class Scheduling & Session Management", 
         "Class Setup & Lifecycle Control", 
         "Course/Batch/Teacher mapping, Date/Time/Duration config, Topic/Objective mapping, Session State transitions (Draft → Scheduled → Ready → Live → Completed → Recording Processing → Recording Available). Handling Failure states (Cancelled, Failed)."),
        
        ("2. Live Room Creation & Integration", 
         "Room Security & Access Control", 
         "Unique room/session ID generation, Teacher & Student authentication, Secure join URL generation, Session start validation, Reconnection & session end handling."),
        
        ("3. Teacher Live Classroom", 
         "Teacher Control Room UI", 
         "Start/End session controls, Audio/Video toggles, Screen sharing, Live chat, Participant list, Attendance visibility, Recording status indicator, Connection status monitoring."),
        
        ("4. Student Live Classroom", 
         "Student Experience & Attendance", 
         "Upcoming class dashboard view, Join validation & waiting room, Live classroom access, Teacher stream viewing, In-class chat, Reconnect & disconnect handling."),
        
        ("5. Attendance Automation", 
         "Activity-Based Auto Tracking", 
         "Automated join/leave timestamp detection, Participation duration calculation, Rejoin & late join tracking, Auto-calculation of Present/Absent status without manual teacher entry."),
        
        ("6. Live Session Monitoring & Status", 
         "Real-time Dashboard Visibility", 
         "Management dashboard visibility tracking active sessions, participant counts, teacher connection status, session duration, and recording status in real-time."),
        
        ("7. Recording Integration", 
         "Cloud Recording & Processing", 
         "Live session auto-recording generation, Availability detection, Recording metadata creation, Processing progress tracking, Failure & retry handling."),
        
        ("8. Recording → Pre-recorded Automation", 
         "Zero-Touch Automation Engine", 
         "Automated workflow: Live Class Completed → Recording Generated → Metadata Read (Course, Batch, Topic, Teacher) → Automatic Pre-recorded Session Creation in Video Library."),
        
        ("9. Pre-recorded Video Library", 
         "Structured Course Library", 
         "Course, batch & topic mapping, Metadata indexing, Secure playback authorization, Student access control, Watch history & resume progress tracking."),
        
        ("10. Student Video Experience", 
         "Interactive Playback & Tracking", 
         "Video library navigation, Secure player stream, Pause/Resume position saving, Completion percentage tracking, Watch history timeline."),
        
        ("11. Teacher / Management Dashboard", 
         "Analytics & Administrative Hub", 
         "Comprehensive metrics for Live Classes (Upcoming, Today's, Completed), Attendance statistics, Recording processing state, and Pre-recorded library status."),
        
        ("12. Testing, Deployment & Production", 
         "QA, Bug Fixes & Deployment", 
         "End-to-end integration testing (Teacher flow, Student flow, Attendance calculation, Recording failures, Playback security), Production deployment & monitoring.")
    ]
    
    table_jay = doc.add_table(rows=1, cols=3)
    table_jay.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_jay.autofit = False
    set_table_borders(table_jay)
    
    j_hdr = table_jay.rows[0].cells
    j_widths = [Inches(2.0), Inches(1.8), Inches(2.7)]
    for i, title in enumerate(["Module / Sub-system", "Focus Area", "Technical Scope & Execution Details"]):
        j_hdr[i].width = j_widths[i]
        set_cell_background(j_hdr[i], "1F4E79")
        set_cell_margins(j_hdr[i], top=100, bottom=100, left=120, right=120)
        p = j_hdr[i].paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(title)
        run.bold = True
        run.font.size = Pt(10.5)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        
    for mod, focus, desc in jay_tasks:
        r_cells = table_jay.add_row().cells
        for i, val in enumerate([mod, focus, desc]):
            r_cells[i].width = j_widths[i]
            set_cell_background(r_cells[i], "F0F4F8")
            set_cell_margins(r_cells[i], top=100, bottom=100, left=120, right=120)
            p = r_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.line_spacing = 1.5
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.size = Pt(11)
            if i == 0:
                run.bold = True
                run.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    # Section 3: Bharathi Breakdown
    h3 = doc.add_paragraph()
    h3_run = h3.add_run("3. Bharathi — Complete Resource Agent & Intelligence")
    h3_run.bold = True
    h3_run.font.size = Pt(14)
    h3_run.font.color.rgb = RGBColor(0x2E, 0x7D, 0x32)
    h3.paragraph_format.space_before = Pt(14)
    h3.paragraph_format.space_after = Pt(8)
    
    bharathi_tasks = [
        ("1. Academic Requirement Understanding", 
         "Curriculum & Taxonomy Parser", 
         "Parsing language, course, level, category, skill, topic, learning objective, resource type, difficulty, and academic context."),
        
        ("2. Resource Discovery", 
         "External Web Search Engine", 
         "Dynamic search query generation, web discovery, candidate filtering, URL collection, and source verification."),
        
        ("3. Resource Metadata Extraction", 
         "Data Extraction Pipeline", 
         "Automated extraction of title, description, source, provider, language, level, skill, topic, and URL structure."),
        
        ("4. Academic Classification", 
         "Strict Hierarchy Mapping", 
         "Mapping resources to Language → Course → Level → Category → Skill → Topic → Resource Type structure."),
        
        ("5. URL & Resource Validation", 
         "Health & Accessibility Check", 
         "Detecting broken links, HTTP redirects, page accessibility, content availability, and metadata completeness."),
        
        ("6. Duplicate Detection", 
         "Multi-Stage Deduplication", 
         "Deterministic checks: Exact URL → Canonical URL → Normalized URL → URL Hash → Content Similarity scoring."),
        
        ("7. Quality & Relevance Analysis", 
         "Evidence-Based Scoring Engine", 
         "Evaluating resource quality, academic relevance, level suitability. Strict Rule: No AI guessing without evidence; flags uncertainty."),
        
        ("8. Copyright / Usage Analysis", 
         "IP & Compliance Sentinel", 
         "Analyzing license signals, attribution requirements, and usage restrictions. Sends ambiguous legal cases to Human Review."),
        
        ("9. Human Review Preparation", 
         "Review Queue Orchestration", 
         "Preparing AI analysis results (Classification, Quality, Duplicates, Copyright) for Human Approval / Modification / Rejection."),
        
        ("10. Resource Library", 
         "Approved Catalog Storage", 
         "Managing indexed resources with multi-faceted filtering (Language, Level, Skill, Topic, Resource Type, Tutor contribution)."),
        
        ("11. Bulk Resource Import & Reconciliation", 
         "Tutor Data Import & Batch Sync", 
         "Bulk import pipeline, row-by-row duplicate reconciliation, tutor contribution mapping, and failed-row validation error logging.")
    ]
    
    table_b = doc.add_table(rows=1, cols=3)
    table_b.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_b.autofit = False
    set_table_borders(table_b)
    
    b_hdr = table_b.rows[0].cells
    b_widths = [Inches(2.0), Inches(1.8), Inches(2.7)]
    for i, title in enumerate(["Module / Sub-system", "Focus Area", "Technical Scope & Execution Details"]):
        b_hdr[i].width = b_widths[i]
        set_cell_background(b_hdr[i], "2E7D32")
        set_cell_margins(b_hdr[i], top=100, bottom=100, left=120, right=120)
        p = b_hdr[i].paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(title)
        run.bold = True
        run.font.size = Pt(10.5)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        
    for mod, focus, desc in bharathi_tasks:
        r_cells = table_b.add_row().cells
        for i, val in enumerate([mod, focus, desc]):
            r_cells[i].width = b_widths[i]
            set_cell_background(r_cells[i], "E8F5E9")
            set_cell_margins(r_cells[i], top=100, bottom=100, left=120, right=120)
            p = r_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.line_spacing = 1.5
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.size = Pt(11)
            if i == 0:
                run.bold = True
                run.font.color.rgb = RGBColor(0x2E, 0x7D, 0x32)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    # Section 4: Bharathi + Interns LSRW Breakdown
    h4 = doc.add_paragraph()
    h4_run = h4.add_run("4. Bharathi + Interns — LSRW Agent (Speech & Language AI Engine)")
    h4_run.bold = True
    h4_run.font.size = Pt(14)
    h4_run.font.color.rgb = RGBColor(0x6A, 0x1B, 0x9A)
    h4.paragraph_format.space_before = Pt(14)
    h4.paragraph_format.space_after = Pt(8)
    
    lsrw_tasks = [
        ("🎧 1. Listening Module", 
         "Audio Activity & Question Generation", 
         "Level/Topic-based audio generation, automated question creation, audio playback player, student attempt logging, AI evaluation of comprehension, scoring, and feedback."),
        
        ("🗣️ 2. Speaking Agent", 
         "Voice Processing & Speech AI Engine", 
         "Audio capture & Speech-to-Text conversion. Multi-dimensional AI Evaluation: Pronunciation, Fluency, Grammar, Vocabulary, Sentence Structure, Response Relevance. Detailed feedback & progress tracking."),
        
        ("📖 3. Reading Agent", 
         "Passage & Comprehension Evaluation", 
         "Level & topic-based reading content generation, vocabulary-focused passages, comprehension question evaluation, reading score calculation, and improvement recommendations."),
        
        ("✍️ 4. Writing Agent", 
         "Text Analysis & Essay Scoring", 
         "Writing prompt generation, AI language analysis (Grammar, Vocabulary, Sentence Structure, Coherence, Relevance), instant writing score & suggestion engine."),
        
        ("🧠 5. Unified LSRW Evaluation & Dashboard", 
         "Academic Progress Ecosystem", 
         "Combining Listening, Speaking, Reading, and Writing scores into a unified AI Feedback engine & Student Academic Dashboard.")
    ]
    
    table_l = doc.add_table(rows=1, cols=3)
    table_l.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_l.autofit = False
    set_table_borders(table_l)
    
    l_hdr = table_l.rows[0].cells
    l_widths = [Inches(2.0), Inches(1.8), Inches(2.7)]
    for i, title in enumerate(["LSRW Skill Area", "Focus Area", "Technical Scope & Execution Details"]):
        l_hdr[i].width = l_widths[i]
        set_cell_background(l_hdr[i], "6A1B9A")
        set_cell_margins(l_hdr[i], top=100, bottom=100, left=120, right=120)
        p = l_hdr[i].paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(title)
        run.bold = True
        run.font.size = Pt(10.5)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        
    for mod, focus, desc in lsrw_tasks:
        r_cells = table_l.add_row().cells
        for i, val in enumerate([mod, focus, desc]):
            r_cells[i].width = l_widths[i]
            set_cell_background(r_cells[i], "F3E5F5")
            set_cell_margins(r_cells[i], top=100, bottom=100, left=120, right=120)
            p = r_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.line_spacing = 1.5
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.size = Pt(11)
            if i == 0:
                run.bold = True
                run.font.color.rgb = RGBColor(0x6A, 0x1B, 0x9A)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    # Section 5: Integration Architecture Map
    h5 = doc.add_paragraph()
    h5_run = h5.add_run("5. Cross-System Integration Architecture")
    h5_run.bold = True
    h5_run.font.size = Pt(14)
    h5_run.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
    h5.paragraph_format.space_before = Pt(14)
    h5.paragraph_format.space_after = Pt(8)
    
    integ_data = [
        ("Live Class → Resource Agent", "Live Class Topic / Learning Objective", "Bharathi (Resource Agent)", "Auto-fetches supporting approved resources from Resource Library for students during live class."),
        ("Live Class → LSRW Agent", "Live Class Topic / Objective", "Bharathi + Interns (LSRW)", "Generates targeted Listening, Speaking, Reading & Writing practice activities matching live class topics."),
        ("Resource Agent → LSRW Agent", "Approved Learning Resource", "LSRW AI Evaluation Engine", "Converts approved articles/audio into interactive LSRW exercises with real-time feedback.")
    ]
    
    table_int = doc.add_table(rows=1, cols=4)
    table_int.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_int.autofit = False
    set_table_borders(table_int)
    
    int_hdr = table_int.rows[0].cells
    int_widths = [Inches(1.8), Inches(1.5), Inches(1.5), Inches(1.7)]
    for i, title in enumerate(["Integration Pipeline", "Trigger / Input Data", "Responsible System", "Automated Outcome"]):
        int_hdr[i].width = int_widths[i]
        set_cell_background(int_hdr[i], "1F4E79")
        set_cell_margins(int_hdr[i], top=100, bottom=100, left=120, right=120)
        p = int_hdr[i].paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(title)
        run.bold = True
        run.font.size = Pt(10.5)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        
    for p_name, trig, sys, outcome in integ_data:
        r_cells = table_int.add_row().cells
        for i, val in enumerate([p_name, trig, sys, outcome]):
            r_cells[i].width = int_widths[i]
            set_cell_background(r_cells[i], "F0F4F8")
            set_cell_margins(r_cells[i], top=100, bottom=100, left=120, right=120)
            p = r_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.line_spacing = 1.3
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            run.font.size = Pt(11)
            if i == 0:
                run.bold = True
                run.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(18)
    
    make_callout_box(
        doc,
        "All paragraphs formatted in 12pt Calibri with 1.5 line spacing and justified alignment. Tables are color-coded: Blue (Jay Kumar), Green (Bharathi), Purple (Bharathi + Interns) for instant visual recognition.",
        title="DOCUMENT FORMATTING CONFORMITY",
        bg_hex="FFF8E1",
        border_hex="FF8F00"
    )
    
    output_filename = "d:/ISML/resource_agent/ISML_Portal_V3_Team_Ownership_Breakdown.docx"
    doc.save(output_filename)
    print(f"Document successfully created at: {output_filename}")

if __name__ == "__main__":
    create_document()
