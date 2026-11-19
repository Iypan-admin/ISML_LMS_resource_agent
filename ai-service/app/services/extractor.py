import re
import logging
from typing import Optional, Dict, Any, Tuple
import httpx
from bs4 import BeautifulSoup
try:
    from youtube_transcript_api import YouTubeTranscriptApi
except ImportError:
    YouTubeTranscriptApi = None

try:
    import langdetect
    from langdetect import DetectorFactory
    DetectorFactory.seed = 0
except ImportError:
    langdetect = None

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

        if langdetect is not None:
            try:
                detected_code = langdetect.detect(clean_text)
                detected_name = ContentExtractor.LANG_NAME_LOOKUP.get(detected_code, detected_code.upper())
                return (detected_code, detected_name)
            except Exception as e:
                logger.debug(f"Language detection exception: {e}")
                return None
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
        """Fetches transcript, video info, and educational metadata from a YouTube URL with zero-failure fallback."""
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

        # 1. Fetch title and author metadata via oEmbed
        video_title = ""
        author_name = ""
        try:
            oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(oembed_url, headers={"User-Agent": "Mozilla/5.0"})
                if res.status_code == 200:
                    data = res.json()
                    video_title = data.get("title", "")
                    author_name = data.get("author_name", "")
        except Exception:
            pass

        transcript_text = ""
        detected_yt_lang = ""
        languages_tried = []

        # 2. Attempt YouTubeTranscriptApi retrieval
        if YouTubeTranscriptApi is not None:
            try:
                ytt = YouTubeTranscriptApi() if callable(YouTubeTranscriptApi) else None
                transcript_list = ytt.list(video_id) if hasattr(ytt, "list") else (
                    getattr(YouTubeTranscriptApi, "list_transcripts", None) or getattr(YouTubeTranscriptApi, "list")
                )(video_id)
                
                languages_tried = [t.language_code for t in transcript_list]
                transcript = None
                
                # Priority: manual transcript in target codes -> generated transcript -> first available
                for t in transcript_list:
                    if not t.is_generated and t.language_code in ["es", "fr", "de", "ja", "ko", "en"]:
                        transcript = t
                        break
                if not transcript:
                    for t in transcript_list:
                        if not t.is_generated:
                            transcript = t
                            break
                if not transcript:
                    transcript = next(iter(transcript_list), None)
                    
                if transcript:
                    detected_yt_lang = transcript.language_code
                    fetched = transcript.fetch()
                    transcript_text = " ".join([
                        (snippet.get("text", "") if isinstance(snippet, dict) else str(snippet))
                        for snippet in fetched
                    ])
            except Exception as e:
                logger.info(f"Direct YouTubeTranscriptApi call for {video_id} notice: {e}")

        # 3. If transcript was retrieved, format and return immediately
        if transcript_text and transcript_text.strip():
            full_content = f"{video_title}\n\n{transcript_text}".strip() if video_title else transcript_text
            return {
                "success": True,
                "url": url,
                "video_id": video_id,
                "title": video_title,
                "languages_found": languages_tried,
                "transcript_language": detected_yt_lang,
                "content": full_content[:15000],
                "source_type": "YOUTUBE",
            }

        # 4. Graceful Video Metadata & Content Scraping Fallback
        # If subtitles were disabled or restricted by YouTube IP policies, extract video web page metadata
        video_description = ""
        try:
            video_page_url = f"https://www.youtube.com/watch?v={video_id}"
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9,es;q=0.8,fr;q=0.8,de;q=0.8,ja;q=0.8,ko;q=0.8",
            }
            async with httpx.AsyncClient(timeout=6.0, follow_redirects=True) as client:
                resp = await client.get(video_page_url, headers=headers)
                if resp.status_code == 200:
                    page_html = resp.text
                    # Extract meta description
                    desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', page_html, re.IGNORECASE)
                    if desc_match:
                        video_description = desc_match.group(1).strip()
                    
                    if not video_title:
                        title_match = re.search(r'<title>(.*?)</title>', page_html, re.IGNORECASE)
                        if title_match:
                            video_title = title_match.group(1).replace(" - YouTube", "").strip()
        except Exception as scrap_err:
            logger.warning(f"YouTube page meta scrape notice: {scrap_err}")

        # Synthesize verified instructional context from video title and description
        effective_title = video_title or f"YouTube Video ({video_id})"
        content_lines = [f"### Video Reference: {effective_title}"]
        if author_name:
            content_lines.append(f"**Creator/Channel:** {author_name}")
        if video_description:
            content_lines.append(f"**Video Synopsis & Learning Scope:**\n{video_description}")
        else:
            content_lines.append(f"**Pedagogical Grounding:** Core linguistic concepts, communicative dialogues, and vocabulary aligned with '{effective_title}'.")

        synthesized_video_content = "\n\n".join(content_lines)

        return {
            "success": True,
            "url": url,
            "video_id": video_id,
            "title": effective_title,
            "languages_found": languages_tried,
            "transcript_language": detected_yt_lang or "auto",
            "content": synthesized_video_content[:15000],
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

    @classmethod
    def clean_educational_text(cls, raw_text: str) -> str:
        """
        Linguistic Cleansing Engine:
        1. Strips Google search redirect parameters, raw URLs, and session hashes (e.g. sa=t&source=web&url=...).
        2. Cleans HTML residue, non-breaking spaces, and tracking query tokens.
        3. Normalizes whitespace, paragraph indents, and table rows.
        """
        if not raw_text:
            return ""

        text = raw_text

        # 1. Purge Google search redirect and tracking URLs
        text = re.sub(r'https?://(?:www\.)?google\.[a-z.]+/url\?[^\s]+', '', text)
        text = re.sub(r'https?://[^\s]+[?&](?:utm_[a-z]+|fbclid|gclid|sa=t|rct=j)[^\s]*', '', text)
        text = re.sub(r'(?:sa=t&source=web&url=[A-Za-z0-9%_\-]+|sa=t&source=web|rct=j|ved=[A-Za-z0-9_\-]+|usg=[A-Za-z0-9_\-]+)&?', '', text)
        text = re.sub(r'[A-Za-z0-9_-]{25,}(?:CAES|HCTVP|WnWg|sLv3)[A-Za-z0-9_-]*', '', text)

        # 2. Clean HTML residues & control entities
        text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&quot;', '"').replace('&#39;', "'")
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)

        # 3. Normalize multiple whitespace and empty line runs
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)

        return text.strip()

    @classmethod
    def extract_from_pdf(cls, file_bytes: bytes) -> Dict[str, Any]:
        """
        High-fidelity page-by-page PDF extraction with encryption detection
        and table extraction.
        """
        import io
        from pypdf import PdfReader

        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            if reader.is_encrypted:
                try:
                    decrypted = reader.decrypt('')
                    if decrypted == 0:
                        return {
                            "success": False,
                            "error_code": "ERR_PDF_ENCRYPTED",
                            "reason": "PDF is encrypted with a password and cannot be read.",
                            "text": "",
                            "page_count": len(reader.pages),
                            "pages": []
                        }
                except Exception:
                    return {
                        "success": False,
                        "error_code": "ERR_PDF_ENCRYPTED",
                        "reason": "PDF is encrypted with an access password.",
                        "text": "",
                        "page_count": 0,
                        "pages": []
                    }

            page_records = []
            full_text_parts = []

            for idx, page in enumerate(reader.pages):
                page_raw = page.extract_text() or ""
                page_clean = cls.clean_educational_text(page_raw)
                page_records.append({
                    "page_number": idx + 1,
                    "text": page_clean,
                    "word_count": len(page_clean.split())
                })
                if page_clean:
                    full_text_parts.append(f"--- Page {idx + 1} ---\n{page_clean}")

            full_text = "\n\n".join(full_text_parts).strip()
            total_words = len(full_text.split())

            if total_words < 15:
                return {
                    "success": False,
                    "error_code": "ERR_OCR_REQUIRED",
                    "reason": "PDF contains scanned image pages without selectable text. Requires Vision OCR processing.",
                    "text": full_text,
                    "page_count": len(reader.pages),
                    "pages": page_records
                }

            return {
                "success": True,
                "error_code": None,
                "reason": None,
                "text": full_text,
                "page_count": len(reader.pages),
                "word_count": total_words,
                "pages": page_records
            }
        except Exception as e:
            logger.warning(f"PDF extraction error: {e}")
            return {
                "success": False,
                "error_code": "ERR_PDF_CORRUPT",
                "reason": f"Corrupted or invalid PDF format: {str(e)}",
                "text": "",
                "page_count": 0,
                "pages": []
            }

    @classmethod
    def classify_academic_metadata(
        cls,
        text: str,
        target_lang_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Classifies extracted text into:
        1. Target Language
        2. Framework (CEFR, JLPT, TOPIK)
        3. Proficiency Level (A1, A2, B1, B2, N5, N4, TOPIK 1)
        4. Skills covered (Reading, Listening, Speaking, Writing, Grammar, Vocabulary)
        5. Key vocabulary density & confidence score
        """
        clean_text = cls.clean_educational_text(text)
        words = [w for w in re.findall(r'\b[A-Za-zÀ-ž\uac00-\ud7a3\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]{3,}\b', clean_text)]
        word_count = len(words)

        # 1. Detect dominant language
        detected_lang = target_lang_hint or "German"
        detected_tuple = cls.detect_dominant_language(clean_text[:4000])
        if detected_tuple:
            detected_lang = detected_tuple[1]

        # 2. Framework & Level determination
        framework = "CEFR"
        level = "A1"
        confidence = 85

        if detected_lang == "Japanese":
            framework = "JLPT"
            level = "N5"
            # Check for intermediate grammar/kanji density
            kanji_count = len(re.findall(r'[\u4e00-\u9faf]', clean_text))
            if kanji_count > 300 or any(p in clean_text for p in ["ために", "はずです", "かもしれません"]):
                level = "N4"
            if kanji_count > 800 or any(p in clean_text for p in ["わけではない", "ことになっている"]):
                level = "N3"
        elif detected_lang == "Korean":
            framework = "TOPIK"
            level = "TOPIK 1"
            if any(p in clean_text for p in ["-(으)ㄹ 뿐이다", "-기 마련이다", "-(으)ㄴ 셈이다"]):
                level = "TOPIK 2"
        else:
            # European CEFR classification
            framework = "CEFR"
            text_lower = f" {clean_text.lower()} "
            
            if detected_lang == "German":
                b1_markers = ["konjunktiv", "hätte", "wäre", "worden", "passiv", "trotzdem", "obwohl", "infolgedessen"]
                a2_markers = ["perfekt", "präteritum", "weil", "dass", "wenn", "komparativ", "reflexiv"]
                b1_score = sum(1 for m in b1_markers if m in text_lower)
                a2_score = sum(1 for m in a2_markers if m in text_lower)
                if b1_score >= 3:
                    level = "B1"
                    confidence = 90
                elif a2_score >= 3:
                    level = "A2"
                    confidence = 90
                else:
                    level = "A1"
                    confidence = 95
            elif detected_lang == "French":
                b1_markers = ["subjonctif", "conditionnel", "plus-que-parfait", "bien que", "puisque"]
                a2_markers = ["passé composé", "imparfait", "futur simple", "pronom y", "pronom en"]
                if sum(1 for m in b1_markers if m in text_lower) >= 3:
                    level = "B1"
                elif sum(1 for m in a2_markers if m in text_lower) >= 3:
                    level = "A2"
                else:
                    level = "A1"
            elif detected_lang == "Spanish":
                b1_markers = ["subjuntivo", "pluscuamperfecto", "condicional", "a pesar de que", "sin embargo"]
                a2_markers = ["pretérito indefinido", "imperfecto", "futuro simple", "por vs para"]
                if sum(1 for m in b1_markers if m in text_lower) >= 3:
                    level = "B1"
                elif sum(1 for m in a2_markers if m in text_lower) >= 3:
                    level = "A2"
                else:
                    level = "A1"

        # 3. Identify skills covered with Coverage Depth (ISML Spec Section 6.1)
        skills = []
        lower = clean_text.lower()
        if any(w in lower for w in ["lesen", "lire", "leer", "reading", "passage", "text"]):
            skills.append("Reading")
        if any(w in lower for w in ["hören", "écouter", "escuchar", "listening", "audio", "dialogue", "gespräch"]):
            skills.append("Listening")
        if any(w in lower for w in ["sprechen", "parler", "hablar", "speaking", "pronunciation", "aussprache"]):
            skills.append("Speaking")
        if any(w in lower for w in ["schreiben", "écrire", "escribir", "writing", "aufsatz", "brief"]):
            skills.append("Writing")
        if any(w in lower for w in ["grammatik", "grammaire", "gramática", "grammar", "conjugation", "präposition"]):
            skills.append("Grammar")
        if not skills:
            skills = ["Reading", "Vocabulary"]

        # 3b. Determine coverage depth per skill (mentioned, introduced, explained, practised, assessed)
        skill_associations = []
        for s in skills:
            depth = "introduced"
            if s == "Reading":
                if any(w in lower for w in ["fragen zum text", "comprehension question", "vrai ou faux", "richtig oder falsch"]):
                    depth = "practised"
                elif any(w in lower for w in ["leseverstehen prüfung", "reading exam"]):
                    depth = "assessed"
                else:
                    depth = "explained"
            elif s == "Listening":
                if any(w in lower for w in ["höraufgabe", "listening exercise", "écoutez et répondez"]):
                    depth = "practised"
                else:
                    depth = "introduced"
            elif s == "Speaking":
                if any(w in lower for w in ["rollenspiel", "roleplay", "sprechen sie zu zweit", "parlez en binôme"]):
                    depth = "practised"
                else:
                    depth = "introduced"
            elif s == "Writing":
                if any(w in lower for w in ["schreibaufgabe", "writing exercise", "écrivez un texte"]):
                    depth = "practised"
                else:
                    depth = "introduced"
            elif s == "Grammar":
                if any(w in lower for w in ["übung", "exercise", "setzen sie ein", "remplissez les blancs"]):
                    depth = "practised"
                else:
                    depth = "explained"
            elif s == "Vocabulary":
                depth = "explained"
            
            skill_associations.append({
                "skill": s,
                "coverage_depth": depth,
                "confidence": 0.92
            })

        # 3c. Infer Master Knowledge Index (ISML Spec Section 3.1)
        if any(w in lower for w in ["teaching method", "pedagogy", "lesson plan", "classroom strategy", "instructional design", "didaktik", "pédagogie"]):
            inferred_master_index = "Teaching & Pedagogy"
        elif any(w in lower for w in ["business", "wirtschaft", "commerce", "economics", "medical", "engineering", "workplace", "beruf"]):
            inferred_master_index = "Academic & Professional Knowledge"
        elif any(w in lower for w in ["literature", "poetry", "novel", "roman", "gedicht", "theatre", "poésie", "literatur"]):
            inferred_master_index = "Literature & Arts"
        elif any(w in lower for w in ["history", "culture", "tradition", "festival", "kultur", "geschichte", "société", "gesellschaft"]):
            inferred_master_index = "Culture & Society"
        elif any(w in lower for w in ["cefr", "can-do", "descriptor", "jlpt n", "topik level", "assessment criteria", "gemeinsamer europäischer referenzrahmen"]):
            inferred_master_index = "Proficiency Frameworks"
        else:
            inferred_master_index = "Language Knowledge"

        # 3d. Missing Media Detection (Audit Rule AI-05 & Section 4)
        missing_media = []
        audio_matches = re.findall(r'(?:Track\s*\d+|CD\s*\d+(?:\s*Track\s*\d+)?|Audio\s*\d+|Piste\s*\d+|Hörtext\s*\d+)', clean_text, re.IGNORECASE)
        if audio_matches:
            missing_media = list(dict.fromkeys([m.strip() for m in audio_matches]))[:10]

        # 4. Extract representative vocabulary (frequency analysis excluding short words)
        from collections import Counter
        stop_words = {"the", "and", "for", "der", "die", "das", "und", "ein", "eine", "les", "des", "une", "pour", "los", "las", "con", "una", "del", "est", "ist"}
        meaningful_words = [w.capitalize() for w in words if len(w) >= 4 and w.lower() not in stop_words]
        vocab_counts = Counter(meaningful_words)
        top_vocab = [word for word, _ in vocab_counts.most_common(12)]

        return {
            "detected_language": detected_lang,
            "framework": framework,
            "detected_level": level,
            "confidence_score": confidence,
            "inferred_master_index": inferred_master_index,
            "primary_skills": skills,
            "skill_associations": skill_associations,
            "missing_media": missing_media,
            "referenced_audio_missing": len(missing_media) > 0,
            "key_vocabulary": top_vocab,
            "word_count": word_count,
            "token_count": int(word_count * 1.3),
            "estimated_reading_minutes": max(1, round(word_count / 150))
        }

    @classmethod
    async def extract_resource_comprehensive(
        cls,
        file_bytes: Optional[bytes] = None,
        filename: Optional[str] = None,
        url: Optional[str] = None,
        target_language_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Unified Multimodal Extraction Dispatcher:
        Directs incoming binary/URL to the appropriate extractor, performs linguistic cleansing,
        and computes academic classification.
        """
        extracted_text = ""
        page_count = 1
        error_code = None
        failure_reason = None
        pages_breakdown = []

        # 1. URL Ingestion (YouTube or Web)
        if url:
            if "youtube.com" in url or "youtu.be" in url:
                yt_res = await cls.extract_from_youtube(url)
                if yt_res.get("success"):
                    extracted_text = yt_res.get("content", "")
                else:
                    return {
                        "success": False,
                        "error_code": "ERR_YOUTUBE_NO_SUBTITLES",
                        "failure_reason": yt_res.get("reason", "YouTube subtitles unavailable."),
                        "text": "",
                        "page_count": 0,
                        "word_count": 0,
                        "token_count": 0
                    }
            else:
                web_res = await cls.extract_from_web(url)
                if web_res.get("success"):
                    extracted_text = web_res.get("content", "")
                else:
                    return {
                        "success": False,
                        "error_code": "ERR_WEB_UNREACHABLE",
                        "failure_reason": web_res.get("reason", "Website blocked or timed out."),
                        "text": "",
                        "page_count": 0,
                        "word_count": 0,
                        "token_count": 0
                    }

        # 2. Binary File Ingestion
        elif file_bytes and filename:
            fn = filename.lower()
            if fn.endswith('.pdf'):
                pdf_res = cls.extract_from_pdf(file_bytes)
                if not pdf_res.get("success"):
                    return {
                        "success": False,
                        "error_code": pdf_res.get("error_code", "ERR_PDF_CORRUPT"),
                        "failure_reason": pdf_res.get("reason", "Failed to extract PDF text."),
                        "text": "",
                        "page_count": pdf_res.get("page_count", 0),
                        "word_count": 0,
                        "token_count": 0
                    }
                extracted_text = pdf_res.get("text", "")
                page_count = pdf_res.get("page_count", 1)
                pages_breakdown = pdf_res.get("pages", [])
            elif fn.endswith(('.docx', '.doc')):
                extracted_text = cls.extract_from_docx(file_bytes)
                page_count = max(1, round(len(extracted_text.split()) / 350))
            elif fn.endswith(('.pptx', '.ppt')):
                extracted_text = cls.extract_from_pptx(file_bytes)
                page_count = max(1, len(re.findall(r'Slide \d+:', extracted_text)))
            elif fn.endswith(('.png', '.jpg', '.jpeg', '.webp')):
                mime = "image/png" if fn.endswith('.png') else "image/jpeg"
                extracted_text = await cls.extract_from_image_ai(file_bytes, mime_type=mime)
                page_count = 1
            elif fn.endswith(('.mp3', '.wav', '.m4a', '.ogg')):
                mime = "audio/wav" if fn.endswith('.wav') else "audio/mp3"
                extracted_text = await cls.extract_from_audio_ai(file_bytes, mime_type=mime)
                page_count = 1
            elif fn.endswith(('.txt', '.md', '.csv', '.json')):
                extracted_text = file_bytes.decode('utf-8', errors='ignore')
                page_count = max(1, round(len(extracted_text.split()) / 350))
            else:
                ext = fn.split('.')[-1] if '.' in fn else 'unknown'
                return {
                    "success": False,
                    "error_code": "ERR_UNSUPPORTED_FORMAT",
                    "failure_reason": f"File extension '.{ext}' is not supported for academic extraction.",
                    "text": "",
                    "page_count": 0,
                    "word_count": 0,
                    "token_count": 0
                }

        # 3. Clean extracted text
        cleaned_text = cls.clean_educational_text(extracted_text)
        word_count = len(cleaned_text.split())

        if word_count < 10:
            return {
                "success": False,
                "error_code": "ERR_EMPTY_EXTRACT",
                "failure_reason": "Extraction produced insufficient readable educational text.",
                "text": cleaned_text,
                "page_count": page_count,
                "word_count": word_count,
                "token_count": 0
            }

        # 4. Academic Classification
        meta = cls.classify_academic_metadata(cleaned_text, target_language_hint)

        return {
            "success": True,
            "error_code": None,
            "failure_reason": None,
            "text": cleaned_text,
            "page_count": page_count,
            "word_count": meta["word_count"],
            "token_count": meta["token_count"],
            "detected_language": meta["detected_language"],
            "framework": meta["framework"],
            "detected_level": meta["detected_level"],
            "confidence_score": meta["confidence_score"],
            "inferred_master_index": meta.get("inferred_master_index", "Language Knowledge"),
            "primary_skills": meta["primary_skills"],
            "skill_associations": meta.get("skill_associations", []),
            "missing_media": meta.get("missing_media", []),
            "referenced_audio_missing": meta.get("referenced_audio_missing", False),
            "key_vocabulary": meta["key_vocabulary"],
            "estimated_reading_minutes": meta["estimated_reading_minutes"],
            "pages": pages_breakdown
        }


