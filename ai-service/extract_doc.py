import sys
import os
import json

def extract_content(file_path):
    if not os.path.exists(file_path):
        return {"success": False, "error": f"File not found: {file_path}", "text": ""}
    
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    pages = 1

    try:
        if ext == ".pdf":
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            pages = len(reader.pages)
            extracted_pages = []
            for i, page in enumerate(reader.pages):
                pt = page.extract_text()
                if pt and pt.strip():
                    extracted_pages.append(f"--- Page {i+1} ---\n{pt.strip()}")
            text = "\n\n".join(extracted_pages)

        elif ext in [".docx", ".doc"]:
            import docx
            doc = docx.Document(file_path)
            paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
            tables_text = []
            for t in doc.tables:
                for row in t.rows:
                    cells = [c.text.strip() for c in row.cells if c.text.strip()]
                    if cells:
                        tables_text.append(" | ".join(cells))
            text = "\n\n".join(paragraphs + tables_text)

        elif ext in [".pptx", ".ppt"]:
            import pptx
            prs = pptx.Presentation(file_path)
            pages = len(prs.slides)
            slides_text = []
            for s_idx, slide in enumerate(prs.slides):
                s_content = []
                for shape in slide.shapes:
                    if shape.has_text_frame and shape.text.strip():
                        s_content.append(shape.text.strip())
                if s_content:
                    slides_text.append(f"--- Slide {s_idx+1} ---\n" + "\n".join(s_content))
            text = "\n\n".join(slides_text)

        else:
            # Plain text, CSV, markdown, etc.
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    text = f.read()
            except UnicodeDecodeError:
                with open(file_path, "r", encoding="latin-1") as f:
                    text = f.read()

        words = len(text.split())
        return {
            "success": True,
            "file_name": os.path.basename(file_path),
            "extension": ext,
            "pages": pages,
            "word_count": words,
            "char_count": len(text),
            "text": text
        }
    except Exception as e:
        return {"success": False, "error": str(e), "text": ""}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No file path provided"}))
        sys.exit(1)
    
    target_path = sys.argv[1]
    result = extract_content(target_path)
    # Output json to stdout
    print(json.dumps(result, ensure_ascii=False))

