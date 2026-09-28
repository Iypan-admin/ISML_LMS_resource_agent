from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Set
import re
import urllib.parse
import asyncio
import httpx
from bs4 import BeautifulSoup
from app.models.requests import ResourceAnalysisRequest
from app.models.responses import ApiResponse
from app.workflows.analyze_resource import AnalyzeResourceWorkflow
from app.services.url_service import UrlService
from app.agents.copyright_agent import CopyrightAgent

router = APIRouter(prefix="/api/v1/ai", tags=["Resource Analysis"])

class ScrapeRequest(BaseModel):
    url: str
    title: Optional[str] = None


# ---------------------------------------------------------------------------
# Utility: Extract clean markdown from a single HTML document
# ---------------------------------------------------------------------------
def html_to_markdown(raw_html: str, page_url: str = "") -> str:
    """Parse raw HTML and return clean Markdown text."""
    try:
        soup = BeautifulSoup(raw_html, "html.parser")

        # Remove noise elements
        for elem in soup(["script", "style", "nav", "footer", "header", "aside",
                          "noscript", "iframe", "svg", "form", "button", "input",
                          "meta", "link"]):
            elem.extract()

        # Remove strictly non-content noise (cookie banners, popups, ads)
        for elem in soup.find_all(True):
            elem_id = (elem.get('id') or '').lower()
            elem_class = ' '.join(elem.get('class') or []).lower()
            if any(p in elem_id or p in elem_class for p in ['cookie-banner', 'cookie-notice', 'gdpr-modal', 'popup-overlay', 'ad-slot', 'ezoic-pub-ad']):
                elem.extract()

        # Smart root selection: check if main/article tag actually holds rich content (>50 words)
        main_candidate = (
            soup.find('main') or
            soup.find('article') or
            soup.find('div', role='main') or
            soup.find('div', class_=re.compile(r'entry-content|post-content|article-body|page-content', re.I))
        )
        if main_candidate and len(main_candidate.get_text(strip=True).split()) >= 50:
            main_content = main_candidate
        else:
            main_content = soup.body or soup
        chunks: List[str] = []
        seen_texts: Set[str] = set()

        # Extract semantic block elements in document order
        for tag in main_content.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                                          'p', 'li', 'dt', 'dd', 'blockquote',
                                          'pre', 'figcaption', 'td', 'th']):
            tag_name = tag.name.lower()
            text = tag.get_text(separator=" ", strip=True)
            if not text or len(text) < 2:
                continue

            # Deduplicate exact same block strings (unless li/td/th)
            if text in seen_texts and tag_name not in ('li', 'td', 'th'):
                continue
            seen_texts.add(text)

            if tag_name == 'h1':
                chunks.append(f"\n# {text}\n")
            elif tag_name == 'h2':
                chunks.append(f"\n## {text}\n")
            elif tag_name == 'h3':
                chunks.append(f"\n### {text}\n")
            elif tag_name == 'h4':
                chunks.append(f"\n#### {text}\n")
            elif tag_name in ('h5', 'h6'):
                chunks.append(f"\n##### {text}\n")
            elif tag_name == 'p':
                chunks.append(f"\n{text}\n")
            elif tag_name == 'li':
                chunks.append(f"- {text}")
            elif tag_name in ('td', 'th'):
                chunks.append(f"| {text} |")
            elif tag_name == 'blockquote':
                chunks.append(f"\n> {text}\n")
            elif tag_name == 'pre':
                chunks.append(f"\n```\n{text}\n```\n")
            elif tag_name in ('dt', 'dd', 'figcaption'):
                chunks.append(f"*{text}*\n")

        result = "\n".join(chunks).strip()

        # Phase 2: If structured extraction yielded too little (< 30 words), do full-text line extraction
        if len(result.split()) < 30:
            lines = []
            for text_line in main_content.get_text(separator="\n", strip=True).splitlines():
                line = text_line.strip()
                if len(line) >= 3 and line not in lines:
                    lines.append(line)
            result = "\n\n".join(lines)

        return result
    except Exception:
        text = re.sub(r'<[^>]+>', ' ', raw_html)
        return "\n".join([line.strip() for line in text.splitlines() if line.strip()])


# ---------------------------------------------------------------------------
# Utility: Discover internal links on the same domain
# ---------------------------------------------------------------------------
def discover_internal_links(raw_html: str, base_url: str, base_domain: str) -> List[str]:
    """Extract unique same-domain links from HTML, ignoring fragments/anchors/media."""
    links: List[str] = []
    seen: Set[str] = set()
    ignore_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.pdf',
                         '.mp3', '.mp4', '.wav', '.zip', '.css', '.js', '.ico',
                         '.woff', '.woff2', '.ttf', '.eot'}

    try:
        soup = BeautifulSoup(raw_html, "html.parser")
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href'].strip()
            if not href or href.startswith('#') or href.startswith('mailto:') or href.startswith('javascript:'):
                continue

            full_url = urllib.parse.urljoin(base_url, href)
            parsed = urllib.parse.urlparse(full_url)

            # Must be same domain
            if parsed.netloc.replace('www.', '') != base_domain.replace('www.', ''):
                continue

            # Strip fragment
            clean = urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, parsed.query, ''))
            
            # Skip media/asset files
            path_lower = parsed.path.lower()
            if any(path_lower.endswith(ext) for ext in ignore_extensions):
                continue

            if clean not in seen and clean != base_url:
                seen.add(clean)
                links.append(clean)
    except Exception:
        pass

    return links


# ---------------------------------------------------------------------------
# Core: Multi-page web crawler  (crawl up to max_pages from seed URL)
# ---------------------------------------------------------------------------
async def crawl_website(seed_url: str, max_pages: int = 15, timeout_per_page: float = 10.0) -> dict:
    """
    Crawl a website starting from seed_url.
    Returns { 'pages': [ { 'url': str, 'title': str, 'markdown': str } ], 'seed_title': str }
    """
    url_service = UrlService()
    parsed_seed = urllib.parse.urlparse(seed_url)
    base_domain = parsed_seed.netloc

    visited: Set[str] = set()
    pages: List[dict] = []
    seed_title = ""

    browser_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,de;q=0.8,fr;q=0.7,ja;q=0.6",
        "Connection": "keep-alive",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
    }

    # Also try seed URL with/without trailing slash
    seed_normalized = seed_url.rstrip('/')
    seed_with_slash = seed_normalized + '/'
    queue = [seed_url]
    if seed_with_slash != seed_url:
        queue.append(seed_with_slash)

    async with httpx.AsyncClient(timeout=timeout_per_page, follow_redirects=True, headers=browser_headers, verify=False) as client:
        while queue and len(pages) < max_pages:
            current_url = queue.pop(0)
            if current_url in visited:
                continue
            visited.add(current_url)

            # Validate URL for SSRF
            is_valid, _ = url_service.validate_url(current_url)
            if not is_valid:
                continue

            try:
                resp = await client.get(current_url)
                if resp.status_code < 200 or resp.status_code >= 300:
                    print(f"  [CRAWL] SKIP {current_url}: HTTP {resp.status_code}")
                    continue
                content_type = resp.headers.get("content-type", "")
                if "text/html" not in content_type and "application/xhtml" not in content_type and "text/" not in content_type:
                    continue

                # httpx handles decompression and charset detection via resp.text
                resp.encoding = resp.charset_encoding or 'utf-8'
                raw_html = resp.text
                if not raw_html or len(raw_html) < 200:
                    continue

                # Skip Cloudflare / bot challenge pages
                if "Just a moment..." in raw_html or "challenges.cloudflare.com" in raw_html or "cf-browser-verification" in raw_html:
                    print(f"  [CRAWL] SKIP {current_url}: Cloudflare protection challenge detected")
                    continue

                # Extract page title
                page_title = ""
                try:
                    soup_title = BeautifulSoup(raw_html, "html.parser")
                    if soup_title.title and soup_title.title.string:
                        page_title = soup_title.title.string.strip()
                except Exception:
                    pass

                # Convert to markdown
                md = html_to_markdown(raw_html, current_url)
                if len(md.split()) < 5:
                    # Too little content, skip this page
                    continue

                pages.append({
                    "url": current_url,
                    "title": page_title,
                    "markdown": md,
                })

                # Record the seed page title
                if current_url == seed_url and page_title:
                    seed_title = page_title

                # Discover more links from this page
                new_links = discover_internal_links(raw_html, current_url, base_domain)
                for link in new_links:
                    if link not in visited and link not in queue:
                        queue.append(link)

                print(f"  [CRAWL] OK Page {len(pages)}/{max_pages}: {current_url} ({len(md.split())} words)")

            except Exception as e:
                print(f"  [CRAWL] FAIL {current_url}: {str(e).encode('ascii', 'replace').decode('ascii')}")
                continue

    return {"pages": pages, "seed_title": seed_title}


@router.post("/analyze", response_model=ApiResponse)
async def analyze_resource(req: ResourceAnalysisRequest):
    """Analyze resource content or URL, ground metadata with NestJS backend, and evaluate quality/copyright."""
    try:
        workflow = AnalyzeResourceWorkflow()
        res = await workflow.run(req)
        if not res.get("success", False):
            raise HTTPException(status_code=400, detail=res.get("error", "Analysis failed"))
        return ApiResponse(
            success=True,
            message="Resource analysis completed successfully",
            data=res,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal AI Service Error: {str(e)}")


@router.post("/scrape-analyze", response_model=ApiResponse)
async def scrape_and_analyze_web_page(req: ScrapeRequest):
    """
    Multi-page web crawler: scrape 10-20 pages from the target website,
    extract full clean content, and evaluate copyright.
    """
    if not req.url or not req.url.strip():
        raise HTTPException(status_code=400, detail="Target URL is required")

    url = req.url.strip()
    url_service = UrlService()
    copyright_agent = CopyrightAgent()

    # Validate seed URL
    is_valid, err_msg = url_service.validate_url(url)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Invalid or restricted URL: {err_msg}")

    parsed_domain = urllib.parse.urlparse(url).netloc

    try:
        # For YouTube URLs, we can only get the oEmbed metadata (no crawling possible)
        is_youtube = "youtube.com" in url.lower() or "youtu.be" in url.lower()

        if is_youtube:
            oembed_title = ""
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    oembed_res = await client.get(
                        f"https://www.youtube.com/oembed?url={urllib.parse.quote(url)}&format=json"
                    )
                    if oembed_res.status_code == 200:
                        yt_json = oembed_res.json()
                        oembed_title = yt_json.get("title", "")
            except Exception:
                pass

            page_title = req.title or oembed_title or f"YouTube Video ({parsed_domain})"
            displayed_text = f"""# 🎬 {page_title}
**Source** : {url}
**Domain** : {parsed_domain}

---

> ⚠️ YouTube does not allow direct content scraping. The video metadata above was extracted via oEmbed.
> To generate a full study guide from this video, please use the **Generate Resource** tool with the video transcript.

---
*Source: {parsed_domain}*
"""
        else:
            # ──────────────────────────────────────────────────────
            # REAL MULTI-PAGE CRAWL (10-20 pages from the website)
            # ──────────────────────────────────────────────────────
            print(f"\n{'='*60}")
            print(f"[CRAWLER] Starting multi-page crawl: {url.encode('ascii', 'replace').decode('ascii')}")
            print(f"{'='*60}")

            crawl_result = await crawl_website(seed_url=url, max_pages=15, timeout_per_page=10.0)
            crawled_pages = crawl_result["pages"]

            print(f"[CRAWLER] Finished: {len(crawled_pages)} pages crawled from {parsed_domain.encode('ascii', 'replace').decode('ascii')}")

            page_title = req.title or crawl_result.get("seed_title", "") or f"Web Resource ({parsed_domain})"

            if not crawled_pages:
                # If crawling returned zero pages, try single-page fetch as final fallback
                try:
                    status_code, content_type, raw_html = await url_service.safe_fetch_url(url, timeout_seconds=12.0)
                    md = html_to_markdown(raw_html, url)
                except Exception as fetch_err:
                    status_code = 403
                    md = ""

                if len(md.split()) < 10:
                    displayed_text = f"# {page_title}\n**Source** : {url}\n**Domain** : {parsed_domain}\n\n---\n\n> ⚠️ Unable to crawl this website directly. The target server ({parsed_domain}) is protected by an automated bot firewall (Cloudflare / Wordfence Security) or dropped connection setup.\n\n> 💡 **Recommended Action**: To generate structured study materials from {parsed_domain}, copy the lesson text and use the **Generate Resource** tool.\n\n---\n*Source: {parsed_domain}*"
                else:
                    displayed_text = f"# {page_title}\n**Source** : {url}\n**Domain** : {parsed_domain}\n\n---\n\n{md}\n\n---\n*Source: {parsed_domain}*"
            else:
                # Build final document from all crawled pages
                sections: List[str] = []

                # Header
                sections.append(f"# 📚 {page_title}")
                sections.append(f"**Source** : {url}")
                sections.append(f"**Domain** : {parsed_domain}")
                sections.append(f"**Pages Crawled** : {len(crawled_pages)} pages from {parsed_domain}")
                sections.append("\n---\n")

                for i, page in enumerate(crawled_pages):
                    p_title = page.get("title", "")
                    p_url = page.get("url", "")
                    p_md = page.get("markdown", "")

                    if i == 0:
                        # First page (seed page) — just include content directly
                        if p_title and p_title.lower() not in page_title.lower():
                            sections.append(f"\n## {p_title}\n")
                        sections.append(p_md)
                    else:
                        # Subsequent crawled pages — add as distinct sections
                        section_header = p_title if p_title else f"Page {i + 1}"
                        sections.append(f"\n\n---\n\n## 📄 {section_header}")
                        sections.append(f"*Source: {p_url}*\n")
                        sections.append(p_md)

                sections.append(f"\n\n---\n*Content scraped from {len(crawled_pages)} pages on {parsed_domain}*")
                displayed_text = "\n".join(sections)

        # Copyright analysis
        words = displayed_text.split()
        word_count = len(words)

        copyright_res = await copyright_agent.analyze_copyright(url=url, content=displayed_text[:5000])

        return ApiResponse(
            success=True,
            message=f"Web crawl completed: {word_count} words extracted",
            data={
                "url": url,
                "title": page_title,
                "domain": parsed_domain,
                "word_count": word_count,
                "scraped_text": displayed_text,
                "full_text_length": len(displayed_text),
                "copyright": copyright_res.model_dump(),
            }
        )
    except Exception as e:
        print(f"[CRAWLER ERROR] {str(e).encode('ascii', 'replace').decode('ascii')}")
        parsed_domain = urllib.parse.urlparse(url).netloc
        copyright_res = await copyright_agent.analyze_copyright(url=url, content="")

        fallback_text = f"""# {req.title or f'Resource ({parsed_domain})'}
**Source**: {url}
**Domain**: {parsed_domain}

---

> Unable to crawl this website. The site may be blocking automated requests or requires JavaScript rendering.
> Error: {str(e).encode('ascii', 'replace').decode('ascii')[:200]}

---
*Source: {parsed_domain}*"""

        return ApiResponse(
            success=True,
            message="Web crawl encountered an error — fallback metadata returned",
            data={
                "url": url,
                "title": req.title or f"Resource ({parsed_domain})",
                "domain": parsed_domain,
                "word_count": len(fallback_text.split()),
                "scraped_text": fallback_text,
                "copyright": copyright_res.model_dump(),
            }
        )
