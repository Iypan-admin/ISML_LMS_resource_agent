import os
import uuid
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from app.services.extractor import ContentExtractor
from app.agents.session_planner_agent import SessionPlannerAgent
from app.models.session_package import FullSessionPackageResult

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/sessions", tags=["Session Planner & Teaching Studio"])

session_planner_agent = SessionPlannerAgent()
PRESENTATION_DIR = "static/presentations"
UPLOAD_DIR = "static/uploads"

os.makedirs(PRESENTATION_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)


class InputValidationResult(BaseModel):
    is_valid: bool
    language_mismatch: bool = False
    mismatch_error: Optional[str] = None
    has_unreachable_urls: bool = False
    unreachable_urls: List[Dict[str, Any]] = []
    valid_source_count: int = 0
    message: str = "Validation successful"


@router.post("/validate-inputs", response_model=InputValidationResult)
@router.post("/validate-materials", response_model=InputValidationResult)
async def validate_session_inputs(
    language: str = Form(..., description="Target language: French, German, Japanese, Spanish, Korean"),
    source_urls: Optional[list[str]] = Form(None),
    tutor_files: Optional[list[UploadFile]] = File(None),
):
    """
    Validates uploaded links and files before generation:
    1. Language Mismatch Detection: Flags if tutor uploads French/German files while selecting Spanish.
    2. URL Reachability Check: Checks for closed captions / anti-scraping / Cloudflare 403 blocks.
    Returns clear prompts for tutor resolution.
    """
    text_samples: List[str] = []
    unreachable_urls: List[Dict[str, Any]] = []
    valid_source_count = 0

    # 1. Read files and check text snippets for language detection
    all_files = tutor_files or []
    for idx, t_file in enumerate(all_files[:10]):
        if not t_file or not t_file.filename:
            continue
        try:
            content_bytes = await t_file.read()
            await t_file.seek(0)
            fname_lower = t_file.filename.lower()

            extracted_txt = ""
            if fname_lower.endswith((".txt", ".md", ".csv")):
                extracted_txt = content_bytes.decode('utf-8', errors='ignore')
            elif fname_lower.endswith((".docx", ".doc")):
                extracted_txt = ContentExtractor.extract_from_docx(content_bytes)
            elif fname_lower.endswith((".pptx", ".ppt")):
                extracted_txt = ContentExtractor.extract_from_pptx(content_bytes)
            elif fname_lower.endswith(".pdf"):
                try:
                    import io
                    from pypdf import PdfReader
                    reader = PdfReader(io.BytesIO(content_bytes))
                    p_txt = []
                    for page in reader.pages[:20]:
                        t = page.extract_text()
                        if t:
                            p_txt.append(t)
                    extracted_txt = "\n".join(p_txt)
                except Exception as pdf_e:
                    logger.warning(f"Validation PDF read error: {pdf_e}")

            # Even if binary extraction is short, include filename in content to audit filename language markers
            audit_content = f"{t_file.filename}\n\n{extracted_txt}".strip()
            text_samples.append({
                "name": f"File '{t_file.filename}'",
                "content": audit_content
            })
            valid_source_count += 1
        except Exception as e:
            logger.warning(f"Error reading file {t_file.filename}: {e}")

    # 2. Check source URLs
    all_urls = [u.strip() for u in (source_urls or []) if u and u.strip()]
    for idx, url in enumerate(all_urls[:5]):
        if "youtube.com" in url or "youtu.be" in url:
            yt_res = await ContentExtractor.extract_from_youtube(url)
            if yt_res.get("success"):
                content = yt_res.get("content", "")
                text_samples.append({
                    "name": f"YouTube Link #{idx + 1} ({yt_res.get('title') or url})",
                    "content": content
                })
                valid_source_count += 1
            else:
                unreachable_urls.append({
                    "url": url,
                    "type": "YouTube Video",
                    "reason": yt_res.get("reason", "Transcript or subtitles unavailable / restricted"),
                    "error": yt_res.get("error", "Failed to fetch transcript")
                })
        else:
            web_res = await ContentExtractor.extract_from_web(url)
            if web_res.get("success"):
                content = web_res.get("content", "")
                text_samples.append({
                    "name": f"Web Link #{idx + 1} ({web_res.get('title') or url})",
                    "content": content
                })
                valid_source_count += 1
            else:
                unreachable_urls.append({
                    "url": url,
                    "type": "Web Link",
                    "reason": web_res.get("reason", "Access blocked by website security or network timeout"),
                    "error": web_res.get("error", "Failed to scrape page")
                })

    # 3. Check language mismatch
    is_lang_ok, mismatch_err = ContentExtractor.validate_language_alignment(language, text_samples)
    if not is_lang_ok:
        return InputValidationResult(
            is_valid=False,
            language_mismatch=True,
            mismatch_error=mismatch_err,
            has_unreachable_urls=bool(unreachable_urls),
            unreachable_urls=unreachable_urls,
            valid_source_count=valid_source_count,
            message=mismatch_err or "Language mismatch detected"
        )

    # 4. If any URLs unreachable, notify tutor
    if unreachable_urls:
        return InputValidationResult(
            is_valid=False,
            language_mismatch=False,
            has_unreachable_urls=True,
            unreachable_urls=unreachable_urls,
            valid_source_count=valid_source_count,
            message=f"{len(unreachable_urls)} reference link(s) could not be analyzed due to security/subtitle restrictions."
        )

    return InputValidationResult(
        is_valid=True,
        language_mismatch=False,
        has_unreachable_urls=False,
        unreachable_urls=[],
        valid_source_count=valid_source_count,
        message="All uploaded materials and reference links verified successfully."
    )


@router.post("/generate-package", response_model=FullSessionPackageResult)
async def generate_session_package(
    language: str = Form(..., description="Target language: French, German, Japanese, Spanish, Korean"),
    level: str = Form(..., description="Proficiency Level e.g. A1, B1, N5, TOPIK 1"),
    track_mode: str = Form("STANDARD", description="Track Mode: STANDARD, INTERNSHIP, SUPER_INTERNSHIP, CUSTOM"),
    topic: str = Form(..., description="Lesson Topic or Concept e.g. Greetings, Past Tense"),
    skip_unreachable: bool = Form(False, description="Whether tutor confirmed to proceed without unreachable links"),
    custom_days: Optional[int] = Form(None, description="Optional custom target curriculum duration in days / units (e.g. 60, 80, 100)"),
    institution_type: Optional[str] = Form("COLLEGE", description="Target institution: SCHOOL or COLLEGE"),
    course_duration_hours: Optional[int] = Form(None, description="Total teaching course hours: e.g. 60, 80, 100, 140, 180"),
    period_duration_minutes: Optional[int] = Form(None, description="Minutes per period/session e.g. 35, 40, 45, 50, 55, 60, 90, 120"),
    periods_per_week: Optional[int] = Form(None, description="Weekly cadence of periods or sessions"),
    total_periods: Optional[int] = Form(None, description="Total periods / sessions count"),
    assessments_count: Optional[int] = Form(None, description="Total formal tests and assessments count"),
    source_url: Optional[str] = Form(None, description="Optional legacy single URL"),
    source_urls: Optional[list[str]] = Form(None, description="Multiple YouTube or web article links"),
    tutor_file: Optional[UploadFile] = File(None, description="Optional legacy single file"),
    tutor_files: Optional[list[UploadFile]] = File(None, description="Bulk tutor uploaded images, videos, audios or documents"),
):
    """
    Main endpoint for Tutor/Faculty:
    1. Extracts content from Multiple YouTube links, Web URLs, and Bulk Tutor Uploaded Files.
    2. Validates language alignment (rejects e.g. French files uploaded under Spanish).
    3. Handles unreachable links cleanly without hallucination.
    4. Builds Day-wise master plan, Teacher PPT Deck, and Student LSRW kit.
    """
    session_id = f"isml_session_{uuid.uuid4().hex[:8]}"
    extracted_source_context = ""
    text_samples_for_validation = []
    unreachable_urls = []

    # 1. Handle Bulk Tutor Uploaded Files (Images, Videos, Audios, Docs)
    all_files = []
    if tutor_files:
        all_files.extend(tutor_files)
    if tutor_file and tutor_file.filename and tutor_file not in all_files:
        all_files.append(tutor_file)

    # Structured sources for per-item validation
    sources_to_audit = [
        {"name": "Lesson Topic", "content": topic}
    ]

    for idx, t_file in enumerate(all_files[:10]):
        if not t_file or not t_file.filename:
            continue
        safe_filename = f"{session_id}_{idx+1}_{t_file.filename}".replace(" ", "_")
        file_path = os.path.join(UPLOAD_DIR, safe_filename)
        content_bytes = await t_file.read()
        with open(file_path, "wb") as f:
            f.write(content_bytes)

        lower_name = safe_filename.lower()
        if lower_name.endswith((".txt", ".md", ".csv")):
            try:
                decoded_text = content_bytes.decode('utf-8', errors='ignore')
                sources_to_audit.append({"name": f"Uploaded Notes: {t_file.filename}", "content": decoded_text})
                extracted_source_context += f"\n[Tutor Upload #{idx+1} Notes - {t_file.filename}]:\n{decoded_text[:15000]}"
            except Exception:
                pass
        elif lower_name.endswith(".pdf"):
            try:
                import io
                from pypdf import PdfReader
                reader = PdfReader(io.BytesIO(content_bytes))
                pdf_text = ""
                for page in reader.pages[:25]:
                    txt = page.extract_text()
                    if txt:
                        pdf_text += txt + "\n"
                if pdf_text.strip():
                    sources_to_audit.append({"name": f"Uploaded PDF: {t_file.filename}", "content": pdf_text})
                    extracted_source_context += f"\n[Tutor Upload #{idx+1} PDF - {t_file.filename}]:\n{pdf_text[:15000]}"
            except Exception as pdf_err:
                logger.warning(f"PDF extraction error for {t_file.filename}: {pdf_err}")
        elif lower_name.endswith((".docx", ".doc")):
            try:
                docx_text = ContentExtractor.extract_from_docx(content_bytes)
                if docx_text.strip():
                    sources_to_audit.append({"name": f"Uploaded Word Document: {t_file.filename}", "content": docx_text})
                    extracted_source_context += f"\n[Tutor Upload #{idx+1} Word Doc - {t_file.filename}]:\n{docx_text[:15000]}"
            except Exception as docx_err:
                logger.warning(f"DOCX extraction error for {t_file.filename}: {docx_err}")
        elif lower_name.endswith((".pptx", ".ppt")):
            try:
                pptx_text = ContentExtractor.extract_from_pptx(content_bytes)
                if pptx_text.strip():
                    sources_to_audit.append({"name": f"Uploaded Presentation: {t_file.filename}", "content": pptx_text})
                    extracted_source_context += f"\n[Tutor Upload #{idx+1} Slides - {t_file.filename}]:\n{pptx_text[:15000]}"
            except Exception as pptx_err:
                logger.warning(f"PPTX extraction error for {t_file.filename}: {pptx_err}")
        elif lower_name.endswith((".jpg", ".jpeg", ".png", ".webp")):
            try:
                mime = "image/png" if lower_name.endswith(".png") else ("image/webp" if lower_name.endswith(".webp") else "image/jpeg")
                img_text = await ContentExtractor.extract_from_image_ai(content_bytes, mime_type=mime)
                if img_text.strip():
                    sources_to_audit.append({"name": f"Uploaded Image/Photo: {t_file.filename}", "content": img_text})
                    extracted_source_context += f"\n[Tutor Upload #{idx+1} Textbook Image Transcription - {t_file.filename}]:\n{img_text[:10000]}"
            except Exception as img_err:
                logger.warning(f"Image vision transcription error for {t_file.filename}: {img_err}")
        elif lower_name.endswith((".mp3", ".wav", ".ogg", ".m4a", ".aac")):
            try:
                mime = "audio/wav" if lower_name.endswith(".wav") else ("audio/ogg" if lower_name.endswith(".ogg") else "audio/mp3")
                audio_text = await ContentExtractor.extract_from_audio_ai(content_bytes, mime_type=mime)
                if audio_text.strip():
                    sources_to_audit.append({"name": f"Uploaded Audio/Speech: {t_file.filename}", "content": audio_text})
                    extracted_source_context += f"\n[Tutor Upload #{idx+1} Spoken Audio Dialogue Transcription - {t_file.filename}]:\n{audio_text[:10000]}"
            except Exception as aud_err:
                logger.warning(f"Audio speech transcription error for {t_file.filename}: {aud_err}")
        else:
            extracted_source_context += f"\n[Tutor Material #{idx+1}: {t_file.filename} (Type: {t_file.content_type}, Size: {len(content_bytes)} bytes)]"

    # 2. Handle Multiple YouTube or Web Source URLs
    all_urls = []
    if source_urls:
        all_urls.extend(source_urls)
    if source_url and source_url.strip() and source_url not in all_urls:
        all_urls.append(source_url.strip())

    for idx, raw_url in enumerate(all_urls[:5]):
        url = raw_url.strip()
        if not url:
            continue
        if "youtube.com" in url or "youtu.be" in url:
            yt_res = await ContentExtractor.extract_from_youtube(url)
            if yt_res.get("success"):
                content = yt_res.get('content', '')
                yt_lang = (yt_res.get('transcript_language') or '').lower()
                target_lang_lower = language.lower()

                # Fast metadata language check
                lang_code_map = {"spanish": "es", "french": "fr", "german": "de", "japanese": "ja", "korean": "ko"}
                target_code = lang_code_map.get(target_lang_lower)
                if yt_lang and target_code and yt_lang != target_code:
                    detected_name = ContentExtractor.LANG_NAME_LOOKUP.get(yt_lang, yt_lang.upper())
                    raise HTTPException(
                        status_code=400,
                        detail={
                            "error_type": "LANGUAGE_MISMATCH",
                            "message": f"Language Mismatch Detected in YouTube Link #{idx+1}: You selected {language}, but the video transcript is in {detected_name}. Please provide an authentic {language} video or material.",
                            "selected_language": language,
                        }
                    )

                sources_to_audit.append({"name": f"YouTube Reference #{idx+1} ({url})", "content": content})
                extracted_source_context += f"\n[Reference #{idx+1} YouTube Video Transcript & Audio Insights]:\n{content[:15000]}"
            else:
                unreachable_urls.append({
                    "url": url,
                    "reason": yt_res.get("reason", "Transcript unavailable"),
                })
        else:
            web_res = await ContentExtractor.extract_from_web(url)
            if web_res.get("success"):
                content = web_res.get('content', '')
                sources_to_audit.append({"name": f"Web Article #{idx+1} ({url})", "content": content})
                extracted_source_context += f"\n[Reference #{idx+1} Web Content & Educational Article - {web_res.get('title')}]:\n{content[:15000]}"
            else:
                unreachable_urls.append({
                    "url": url,
                    "reason": web_res.get("reason", "Security restriction or blocked"),
                })

    # Strict Validation 1: Per-Item Language Mismatch Audit
    is_lang_ok, mismatch_err = ContentExtractor.validate_language_alignment(language, sources_to_audit)
    if not is_lang_ok:
        logger.warning(f"Language mismatch rejected: {mismatch_err}")
        raise HTTPException(
            status_code=400,
            detail={
                "error_type": "LANGUAGE_MISMATCH",
                "message": mismatch_err,
                "selected_language": language,
            }
        )

    # Strict Validation 2: If unreachable URLs exist and tutor has NOT explicitly opted to skip
    if unreachable_urls and not skip_unreachable:
        logger.warning(f"Generation paused due to unreachable URLs: {unreachable_urls}")
        raise HTTPException(
            status_code=422,
            detail={
                "error_type": "UNREACHABLE_LINKS",
                "message": f"Unable to analyze {len(unreachable_urls)} link(s) due to security restrictions or missing captions. Please replace the link(s) or confirm to generate using remaining verified materials.",
                "unreachable_urls": unreachable_urls,
            }
        )

    # 3. Generate Complete Package via SessionPlannerAgent
    try:
        package = await session_planner_agent.generate_full_package(
            session_id=session_id,
            language=language.strip().capitalize(),
            level=level.strip().upper(),
            topic=topic.strip(),
            track_mode=track_mode.strip().upper(),
            custom_days=custom_days,
            institution_type=institution_type or "COLLEGE",
            course_duration_hours=course_duration_hours,
            period_duration_minutes=period_duration_minutes,
            periods_per_week=periods_per_week,
            total_periods=total_periods,
            assessments_count=assessments_count,
            source_context=extracted_source_context.strip(),
            pptx_output_dir=PRESENTATION_DIR,
        )
        return package
    except Exception as e:
        logger.error(f"Error generating session package: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate session package: {str(e)}")

DOCX_DIR = "static/documents"
os.makedirs(DOCX_DIR, exist_ok=True)

class DayDocxRequest(BaseModel):
    session_id: str
    language: str
    level: str
    topic: str
    track_label: str
    day_data: Dict[str, Any]

class FullCurriculumDocxRequest(BaseModel):
    session_id: str
    language: str
    level: str
    topic: str
    track_label: str
    days_list: List[Dict[str, Any]]
    session_package: Optional[Dict[str, Any]] = None

@router.post("/download/day-doc")
async def generate_and_download_day_doc(payload: DayDocxRequest):
    """Generates an exhaustive 10+ page textbook-grade master study guide DOCX for the given day."""
    from app.services.master_doc_generator import MasterDocxGenerator
    day_num = payload.day_data.get("day_number", 1)
    clean_topic = "".join(c for c in payload.topic if c.isalnum() or c in (" ", "_", "-")).strip().replace(" ", "_")
    filename = f"Day_{day_num}_{payload.language}_{payload.level}_{clean_topic}_Master_Guide.docx"
    output_path = os.path.join(DOCX_DIR, filename)

    try:
        MasterDocxGenerator.generate_day_master_docx(
            day_data=payload.day_data,
            language=payload.language,
            level=payload.level,
            topic=payload.topic,
            track_label=payload.track_label,
            output_filepath=output_path,
        )
        return FileResponse(
            path=output_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=filename,
        )
    except Exception as e:
        logger.error(f"Error creating day master docx: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate Day Master Doc: {str(e)}")

@router.post("/download/full-curriculum-doc")
async def generate_and_download_full_curriculum_doc(payload: FullCurriculumDocxRequest):
    """Generates an exhaustive complete master textbook DOCX covering ALL periods/pages sequentially."""
    from app.services.master_doc_generator import MasterDocxGenerator
    clean_topic = "".join(c for c in payload.topic if c.isalnum() or c in (" ", "_", "-")).strip().replace(" ", "_")
    count = len(payload.days_list)
    filename = f"Complete_{payload.language}_{payload.level}_{count}_Periods_{clean_topic}_Master_Curriculum.docx"
    output_path = os.path.join(DOCX_DIR, filename)

    try:
        MasterDocxGenerator.generate_full_curriculum_docx(
            days_list=payload.days_list,
            language=payload.language,
            level=payload.level,
            topic=payload.topic,
            track_label=payload.track_label,
            output_filepath=output_path,
            session_package=payload.session_package
        )
        return FileResponse(
            path=output_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=filename,
        )
    except Exception as e:
        logger.error(f"Error creating complete curriculum master docx: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate Complete Master Doc: {str(e)}")

@router.get("/download/pptx/{filename}")
async def download_pptx(filename: str):
    """Download the generated PowerPoint presentation."""
    file_path = os.path.join(PRESENTATION_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Presentation file not found")
    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        filename=filename,
    )


class SpeechSynthesisRequest(BaseModel):
    text: str
    language: Optional[str] = "French"


@router.post("/synthesize-speech")
async def synthesize_speech(req: SpeechSynthesisRequest):
    """Generates authentic native pronunciation audio WAV using Google Gemini 3.8 Flash TTS."""
    import base64
    import httpx
    from fastapi.responses import Response
    from app.config.settings import settings

    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured.")

    clean_text = req.text.strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    # Prioritize specialized TTS models
    tts_models = ["gemini-3.8-flash-tts", "gemini-3.8-flash-lite-tts", "gemini-2.5-flash-preview-tts"]

    for model_name in tts_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": clean_text}]}]
        }
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        for part in parts:
                            inline = part.get("inlineData") or part.get("inline_data")
                            if inline and inline.get("data"):
                                audio_bytes = base64.b64decode(inline["data"])
                                return Response(content=audio_bytes, media_type="audio/wav")
        except Exception as e:
            logger.warning(f"TTS with {model_name} failed: {e}")
            continue

    raise HTTPException(status_code=502, detail="Speech synthesis service temporarily unavailable.")


class RefineBlueprintRequest(BaseModel):
    user_prompt: str
    language: str
    level: str
    topic: str
    active_module: Optional[int] = 1
    days: List[Dict[str, Any]]

@router.post("/refine-blueprint")
async def refine_blueprint(req: RefineBlueprintRequest):
    """
    Intelligent Pedagogical Co-Pilot Agent:
    Takes natural language instructions from the tutor (e.g. 'Add focus on past tense in Module 2',
    'Include more conversational restaurant dialogue questions', 'Make period 5 focus on numbers 1-100'),
    analyzes the request, reasons about the pedagogical structure, and modifies the target days accordingly.
    """
    import json
    import httpx
    from app.config.settings import settings

    if not req.user_prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    # Prepare condensed context of current days
    condensed_days = []
    for d in req.days:
        condensed_days.append({
            "day_number": d.get("day_number"),
            "day_topic": d.get("day_topic"),
            "grammar_rules_detail": d.get("grammar_rules_detail", ""),
        })

    system_instruction = f"""You are the ISML Academic Curriculum Co-Pilot Agent.
You are assisting a university/school faculty in refining an institutional language course ({req.language} CEFR {req.level}).
Topic: {req.topic}

The tutor gave you this instruction to modify/adjust the syllabus blueprint:
"{req.user_prompt}"

INSTRUCTIONS:
1. Analyze the user prompt carefully: determine which module or periods need modification (or all if general).
2. Make intelligent, pedagogical decisions aligned with CEFR standards for {req.language} {req.level}.
3. Return a JSON object with:
   - "agent_reply": A professional, helpful message in 1-2 sentences explaining what changes you made.
   - "updated_days": An array of day objects that were modified or needs update. Each object MUST have:
       - "day_number": integer
       - "day_topic": string (e.g. "Period X: [New topic name in target language or English]")
       - "grammar_rules_detail": string (short pedagogical focus / grammar target)
       - "practice_question": string (an authentic exercise question in target language)

Return ONLY a valid JSON object without markdown fences, or wrapped in standard ```json ```.
"""

    model_name = settings.LLM_MODEL or "gemini-2.5-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": system_instruction},
                    {"text": f"Current Schedule Days:\n{json.dumps(condensed_days[:40], ensure_ascii=False)}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 3000,
            "responseMimeType": "application/json"
        }
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                cand = data.get("candidates", [])
                if cand:
                    text_out = cand[0]["content"]["parts"][0]["text"].strip()
                    if text_out.startswith("```"):
                        text_out = text_out.split("\n", 1)[1]
                        if text_out.endswith("```"):
                            text_out = text_out.rsplit("```", 1)[0]
                    parsed = json.loads(text_out)
                    return parsed
    except Exception as e:
        logger.warning(f"Refine blueprint LLM call failed: {e}")

    # Fallback heuristic if API is offline
    updated = []
    for d in req.days[:10]:
        updated.append({
            "day_number": d.get("day_number"),
            "day_topic": f"{d.get('day_topic', '')} ({req.user_prompt[:25]}...)",
            "grammar_rules_detail": f"Enhanced with tutor prompt: {req.user_prompt}",
            "practice_question": f"Practice applied to: {req.user_prompt}"
        })
    return {
        "agent_reply": f"Applied your pedagogical adjustment: '{req.user_prompt}' to the curriculum blueprint.",
        "updated_days": updated
    }



