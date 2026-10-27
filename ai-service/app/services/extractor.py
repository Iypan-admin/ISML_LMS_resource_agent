import re
import logging
from typing import Optional, Dict, Any, Tuple
import httpx
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi
import langdetect
from langdetect import DetectorFactory

# Set seed for deterministic language detection
DetectorFactory.seed = 0

logger = logging.getLogger(__name__)

class ContentExtractor:
    """Service to extract text & context from YouTube links, web articles, and documents, with language validation."""

    # Map our supported 5 core languages to language codes
    TARGET_LANG_MAP = {
        "Spanish": ["es"],
        "German": ["de"],
        "French": ["fr"],
        "Japanese": ["ja"],
        "Korean": ["ko"],
    }

    LANG_NAME_LOOKUP = {
        "es": "Spanish",
        "de": "German",
        "fr": "French",
        "ja": "Japanese",
        "ko": "Korean",
        "en": "English",
        "it": "Italian",
        "pt": "Portuguese",
        "zh": "Chinese",
        "zh-cn": "Chinese",
        "zh-tw": "Chinese",
        "ru": "Russian",
        "ar": "Arabic",
    }

    @staticmethod
    def detect_dominant_language(text: str) -> Optional[Tuple[str, str]]:
        """
        Detects dominant language of the text.
        Returns tuple of (lang_code, language_name), or None if cannot reliably determine.
        """
        clean_text = text.strip()
        if len(clean_text) < 10:
            return None

        # Quick Script checks for Japanese and Korean
        hangul_count = len(re.findall(r'[\uac00-\ud7a3\u1100-\u11ff]', clean_text))
        kana_count = len(re.findall(r'[\u3040-\u309f\u30a0-\u30ff]', clean_text))

        if hangul_count >= 3:
            return ("ko", "Korean")
        if kana_count >= 3:
            return ("ja", "Japanese")

        try:
            detected_code = langdetect.detect(clean_text)
            detected_name = ContentExtractor.LANG_NAME_LOOKUP.get(detected_code, detected_code.upper())
            return (detected_code, detected_name)
        except Exception as e:
            logger.debug(f"Language detection exception: {e}")
            return None

    @staticmethod
    def validate_single_source_alignment(
        selected_language: str,
        source_name: str,
        text_content: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Comprehensive linguistic audit for a single file or link transcript.
        If any single file or link contains a conflicting foreign language, flags it specifically.
        """
        target_lang = selected_language.capitalize()
        if not text_content or len(text_content.strip()) < 15:
            return (True, None)

        lowered = f" {text_content.lower()} "

        # Substantive markers (high-frequency grammatical function words unique to each language)
        french_distinct = [" le ", " la ", " les ", " des ", " du ", " une ", " un ", " dans ", " avec ", " pour ", " vous ", " nous ", " ils ", " elle ", " elles ", " est ", " sont ", " être ", " avoir ", " parler ", " français ", " bonjour "]
        spanish_distinct = [" el ", " la ", " los ", " las ", " unos ", " unas ", " en ", " con ", " para ", " por ", " usted ", " ustedes ", " nosotros ", " ellos ", " ellas ", " es ", " son ", " ser ", " estar ", " hablar ", " español ", " hola "]
        german_distinct = [" der ", " die ", " das ", " dem ", " den ", " ein ", " eine ", " einer ", " einem ", " und ", " nicht ", " mit ", " für ", " auf ", " ist ", " sind ", " ich ", " du ", " wir ", " ihr ", " sprechen ", " deutsch "]

        # Check script-based languages (Hangul & Kana)
        hangul_count = len(re.findall(r'[\uac00-\ud7a3\u1100-\u11ff]', text_content))
        kana_count = len(re.findall(r'[\u3040-\u309f\u30a0-\u30ff]', text_content))

        if target_lang in ["French", "Spanish", "German"]:
            if hangul_count >= 5:
                return (False, f"Language Mismatch Detected in '{source_name}': You selected {selected_language}, but this file/source contains Korean text. Please upload authentic {selected_language} materials.")
            if kana_count >= 5:
                return (False, f"Language Mismatch Detected in '{source_name}': You selected {selected_language}, but this file/source contains Japanese text. Please upload authentic {selected_language} materials.")

        if target_lang == "Japanese" and kana_count == 0 and len(text_content) > 80:
            fr_c = sum(1 for m in french_distinct if m in lowered)
            es_c = sum(1 for m in spanish_distinct if m in lowered)
            de_c = sum(1 for m in german_distinct if m in lowered)
            if fr_c >= 2 or es_c >= 2 or de_c >= 2:
                return (False, f"Language Mismatch Detected in '{source_name}': You selected Japanese (日本語), but this file is in a European language without Japanese characters.")

        if target_lang == "Korean" and hangul_count == 0 and len(text_content) > 80:
            fr_c = sum(1 for m in french_distinct if m in lowered)
            es_c = sum(1 for m in spanish_distinct if m in lowered)
            de_c = sum(1 for m in german_distinct if m in lowered)
            if fr_c >= 2 or es_c >= 2 or de_c >= 2:
                return (False, f"Language Mismatch Detected in '{source_name}': You selected Korean (한국어), but this file contains no Korean characters.")

        # Distinct European markers
        fr_matches = sum(1 for m in french_distinct if m in lowered)
        es_matches = sum(1 for m in spanish_distinct if m in lowered)
        de_matches = sum(1 for m in german_distinct if m in lowered)

        # Also run langdetect on sample if text is long enough
        lang_detected_tuple = ContentExtractor.detect_dominant_language(text_content[:2000])
        detected_code = lang_detected_tuple[0] if lang_detected_tuple else None

        if target_lang == "French":
            if (es_matches >= 2 and fr_matches == 0) or (es_matches >= 3 and es_matches > fr_matches * 2) or detected_code == "es":
                return (False, f"Language Mismatch Detected in '{source_name}': You selected French (Français), but this material is in Spanish. Please provide authentic French resources.")
            if (de_matches >= 2 and fr_matches == 0) or (de_matches >= 3 and de_matches > fr_matches * 2) or detected_code == "de":
                return (False, f"Language Mismatch Detected in '{source_name}': You selected French (Français), but this material is in German. Please provide authentic French resources.")

        elif target_lang == "Spanish":
            if (fr_matches >= 2 and es_matches == 0) or (fr_matches >= 3 and fr_matches > es_matches * 2) or detected_code == "fr":
                return (False, f"Language Mismatch Detected in '{source_name}': You selected Spanish (Español), but this material appears to be French. Please provide authentic Spanish resources.")
            if (de_matches >= 2 and es_matches == 0) or (de_matches >= 3 and de_matches > es_matches * 2) or detected_code == "de":
                return (False, f"Language Mismatch Detected in '{source_name}': You selected Spanish (Español), but this material is in German. Please provide authentic Spanish resources.")

        elif target_lang == "German":
            if (fr_matches >= 2 and de_matches == 0) or (fr_matches >= 3 and fr_matches > de_matches * 2) or detected_code == "fr":
                return (False, f"Language Mismatch Detected in '{source_name}': You selected German (Deutsch), but this material is in French. Please provide German resources.")
            if (es_matches >= 2 and de_matches == 0) or (es_matches >= 3 and es_matches > de_matches * 2) or detected_code == "es":
                return (False, f"Language Mismatch Detected in '{source_name}': You selected German (Deutsch), but this material is in Spanish. Please provide German resources.")

        return (True, None)

    @staticmethod
    def validate_language_alignment(
        selected_language: str,
        sources_to_check: list[dict] # [{'name': '...', 'content': '...'}]
    ) -> Tuple[bool, Optional[str]]:
        """
        Thoroughly audits every single file, URL transcript, and the lesson topic.
        If even ONE file or link is in a different language, returns a detailed mismatch error.
        """
        for idx, item in enumerate(sources_to_check):
            if isinstance(item, dict):
                name = item.get("name", f"Resource #{idx + 1}")
                content = item.get("content", "")
            else:
                name = f"Resource #{idx + 1}"
                content = str(item)

            # Topic check
            if name == "Lesson Topic":
                val_lower = f" {content.lower()} "
                target_lang = selected_language.capitalize()
                if target_lang == "French" and any(w in val_lower for w in [" spanish ", " español ", " espanol ", " german ", " deutsch ", " japanese ", " korean "]):
                    detected_word = "Spanish" if "span" in val_lower else ("German" if "deutsch" in val_lower or "german" in val_lower else "Foreign")
                    return (False, f"Language Mismatch Detected in Lesson Topic: You selected French (Français), but your topic specifies {detected_word}. Please adjust your topic or select {detected_word}.")
                if target_lang == "Spanish" and any(w in val_lower for w in [" french ", " français ", " francais ", " german ", " deutsch ", " japanese ", " korean "]):
                    detected_word = "French" if "french" in val_lower or "fran" in val_lower else ("German" if "deutsch" in val_lower or "german" in val_lower else "Foreign")
                    return (False, f"Language Mismatch Detected in Lesson Topic: You selected Spanish (Español), but your topic specifies {detected_word}. Please adjust your topic or select {detected_word}.")
                continue

            # Full linguistic analysis of file/link content
            is_valid, err = ContentExtractor.validate_single_source_alignment(selected_language, name, content)
            if not is_valid:
                return (False, err)

        return (True, None)

    @staticmethod
    def extract_youtube_video_id(url: str) -> Optional[str]:
        """Extracts 11-character video ID from various YouTube URL formats."""
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
            r'(?:youtu\.be\/)([0-9A-Za-z_-]{11})',
            r'(?:embed\/)([0-9A-Za-z_-]{11})',
            r'(?:shorts\/)([0-9A-Za-z_-]{11})',
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    @classmethod
    async def extract_from_youtube(cls, url: str) -> Dict[str, Any]:
        """Fetches transcript and video info from a YouTube URL."""
        video_id = cls.extract_youtube_video_id(url)
        if not video_id:
            return {
                "success": False,
                "url": url,
                "error": "Invalid YouTube URL format.",
                "reason": "Invalid URL structure",
                "content": "",
                "source_type": "YOUTUBE"
            }

        # Fetch title and video metadata via oEmbed
        video_title = ""
        try:
            oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(oembed_url, headers={"User-Agent": "Mozilla/5.0"})
                if res.status_code == 200:
                    video_title = res.json().get("title", "")
        except Exception:
            pass

        transcript_text = ""
        languages_tried = []
        try:
            # Instantiate or call list
            ytt = YouTubeTranscriptApi() if callable(YouTubeTranscriptApi) else None
            transcript_list = ytt.list(video_id) if hasattr(ytt, "list") else (
                getattr(YouTubeTranscriptApi, "list_transcripts", None) or getattr(YouTubeTranscriptApi, "list")
            )(video_id)
            
            languages_tried = [t.language_code for t in transcript_list]
            
            # Fetch the actual native transcript of the video
            transcript = None
            try:
                # First try native manual transcripts (es, fr, de, ja, ko)
                for t in transcript_list:
                    if not t.is_generated:
                        transcript = t
                        break
                if not transcript:
                    transcript = next(iter(transcript_list))
            except Exception:
                pass
                
            detected_yt_lang = transcript.language_code if transcript else ""
            if transcript:
                fetched = transcript.fetch()
                transcript_text = " ".join([
                    (snippet.get('text', '') if isinstance(snippet, dict) else str(snippet))
                    for snippet in fetched
                ])

            # Prepend video title if available
            full_content = f"{video_title}\n\n{transcript_text}".strip() if video_title else transcript_text

            if not full_content.strip():
                return {
                    "success": False,
                    "url": url,
                    "video_id": video_id,
                    "title": video_title,
                    "error": "No subtitles or closed captions available for this video.",
                    "reason": "Subtitles are disabled or not generated for this video",
                    "content": "",
                    "source_type": "YOUTUBE",
                }

            return {
                "success": True,
                "url": url,
                "video_id": video_id,
                "title": video_title,
                "languages_found": languages_tried,
                "transcript_language": detected_yt_lang,
                "content": full_content[:12000],
                "source_type": "YOUTUBE",
            }
        except Exception as e:
            err_msg = str(e)
            logger.warning(f"Failed to fetch YouTube transcript for {video_id}: {err_msg}")
            reason = "Subtitles unavailable or restricted by YouTube"
            if "TranscriptsDisabled" in err_msg or "disabled" in err_msg.lower():
                reason = "Subtitles are disabled on this video by the uploader"
            elif "NoTranscriptFound" in err_msg:
                reason = "No matching audio transcript was found"
            elif "VideoUnavailable" in err_msg:
                reason = "Video is private, restricted, or unavailable"

            return {
                "success": False,
                "url": url,
                "video_id": video_id,
                "error": err_msg,
                "reason": reason,
                "content": "",
                "source_type": "YOUTUBE",
            }

    @classmethod
    async def extract_from_web(cls, url: str) -> Dict[str, Any]:
        """Scrapes educational text from a web article or resource link with security detection."""
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept-Language": "en-US,en;q=0.9,es;q=0.8,fr;q=0.7",
                }
                resp = await client.get(url, headers=headers)
                
                if resp.status_code in [401, 403]:
                    return {
                        "success": False,
                        "url": url,
                        "error": f"HTTP {resp.status_code} Forbidden/Unauthorized",
                        "reason": "Website blocks automated access (Security / Cloudflare protection / Paywall)",
                        "content": "",
                        "source_type": "WEB_ARTICLE",
                    }
                
                resp.raise_for_status()

                soup = BeautifulSoup(resp.text, 'html.parser')
                for s in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
                    s.decompose()

                title = soup.title.string.strip() if (soup.title and soup.title.string) else ""
                paragraphs = [p.get_text().strip() for p in soup.find_all(['p', 'h1', 'h2', 'h3', 'li']) if p.get_text().strip()]
                extracted_text = "\n".join(paragraphs)

                if len(extracted_text) < 50:
                    return {
                        "success": False,
                        "url": url,
                        "title": title,
                        "error": "Extracted text is empty or blocked by client-side JavaScript rendering.",
                        "reason": "Website requires JavaScript execution or is protected behind a firewall",
                        "content": "",
                        "source_type": "WEB_ARTICLE",
                    }

                return {
                    "success": True,
                    "url": url,
                    "title": title,
                    "content": extracted_text[:15000],
                    "source_type": "WEB_ARTICLE",
                }
        except httpx.HTTPStatusError as e:
            return {
                "success": False,
                "url": url,
                "error": str(e),
                "reason": f"Website returned error status {e.response.status_code} (access restricted)",
                "content": "",
                "source_type": "WEB_ARTICLE",
            }
        except Exception as e:
            logger.warning(f"Web extraction failed for {url}: {e}")
            return {
                "success": False,
                "url": url,
                "error": str(e),
                "reason": "Website is unreachable, network timed out, or blocked security access",
                "content": "",
                "source_type": "WEB_ARTICLE",
            }

    @classmethod
    def extract_from_pptx(cls, file_bytes: bytes) -> str:
        """Extracts slide titles, bullet points, and speaker notes from PowerPoint presentation files."""
        try:
            import io
            import pptx
            prs = pptx.Presentation(io.BytesIO(file_bytes))
            slide_texts = []
            for s_idx, slide in enumerate(prs.slides[:30]):
                slide_content = []
                for shape in slide.shapes:
                    if shape.has_text_frame and shape.text.strip():
                        slide_content.append(shape.text.strip())
                if slide_content:
                    slide_texts.append(f"Slide {s_idx + 1}:\n" + "\n".join(slide_content))
            return "\n\n".join(slide_texts)
        except Exception as e:
            logger.warning(f"Failed to extract PPTX text: {e}")
            return ""

    @classmethod
    def extract_from_docx(cls, file_bytes: bytes) -> str:
        """Extracts textbook chapters, paragraphs, and tables from Word documents."""
        try:
            import io
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
            
            # Also extract table text
            table_texts = []
            for t in doc.tables:
                for row in t.rows:
                    row_cells = [c.text.strip() for c in row.cells if c.text.strip()]
                    if row_cells:
                        table_texts.append(" | ".join(row_cells))
            
            full_parts = paragraphs + table_texts
            return "\n\n".join(full_parts)
        except Exception as e:
            logger.warning(f"Failed to extract DOCX text: {e}")
            return ""

    @classmethod
    async def extract_from_image_ai(cls, file_bytes: bytes, mime_type: str = "image/jpeg") -> str:
        """Transcribes and analyzes educational textbook photos, whiteboard notes, and worksheets using Gemini Vision."""
        from app.config.settings import settings
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY.startswith("AQ.placeholder"):
            return ""
        try:
            import base64
            img_b64 = base64.b64encode(file_bytes).decode('utf-8')
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{
                    "parts": [
                        {"inline_data": {"mime_type": mime_type, "data": img_b64}},
                        {"text": "Transcribe and extract ALL educational textbook text, grammar rules, vocabulary words with translations, table conjugations, and exercises from this image verbatim. If foreign language text is present, extract it exactly as written."}
                    ]
                }],
                "generationConfig": {"temperature": 0.1, "maxOutputTokens": 2048}
            }
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    cand = res.json().get("candidates", [])
                    if cand:
                        return cand[0]["content"]["parts"][0]["text"].strip()
        except Exception as e:
            logger.warning(f"Vision transcription failed: {e}")
        return ""

    @classmethod
    async def extract_from_audio_ai(cls, file_bytes: bytes, mime_type: str = "audio/mp3") -> str:
        """Transcribes spoken speech, classroom dialogues, and language drills from uploaded audio files using Gemini Audio."""
        from app.config.settings import settings
        if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY.startswith("AQ.placeholder"):
            return ""
        try:
            import base64
            # Standardize mime types
            norm_mime = "audio/wav" if "wav" in mime_type.lower() else ("audio/ogg" if "ogg" in mime_type.lower() else "audio/mp3")
            audio_b64 = base64.b64encode(file_bytes).decode('utf-8')
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{
                    "parts": [
                        {"inline_data": {"mime_type": norm_mime, "data": audio_b64}},
                        {"text": "Transcribe every spoken sentence, dialogue turn, and vocabulary drill in this language audio file verbatim. Identify speaker turns (Teacher/Student) if present."}
                    ]
                }],
                "generationConfig": {"temperature": 0.1, "maxOutputTokens": 2048}
            }
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    cand = res.json().get("candidates", [])
                    if cand:
                        return cand[0]["content"]["parts"][0]["text"].strip()
        except Exception as e:
            logger.warning(f"Audio transcription failed: {e}")
        return ""

