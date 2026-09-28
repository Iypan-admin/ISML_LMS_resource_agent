import urllib.parse
import socket
import ipaddress
import hashlib
from typing import Tuple, List, Optional
from pydantic import BaseModel
import httpx

ALLOWED_SCHEMES = {"http", "https"}

# Blocked IP Networks for SSRF protection
BANNED_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),          # Loopback
    ipaddress.ip_network("10.0.0.0/8"),           # Private Class A
    ipaddress.ip_network("172.16.0.0/12"),        # Private Class B
    ipaddress.ip_network("192.168.0.0/16"),       # Private Class C
    ipaddress.ip_network("169.254.0.0/16"),       # Link-local / Cloud Metadata (169.254.169.254)
    ipaddress.ip_network("0.0.0.0/8"),            # Current network
    ipaddress.ip_network("::1/128"),              # IPv6 Loopback
    ipaddress.ip_network("fc00::/7"),             # IPv6 Unique Local
    ipaddress.ip_network("fe80::/10"),            # IPv6 Link-Local
]

class SSRFSecurityError(ValueError):
    """Raised when a URL violates SSRF security rules."""
    pass

class UrlValidationResult(BaseModel):
    is_valid: bool
    sanitized_url: Optional[str] = None
    url_hash: Optional[str] = None
    domain: Optional[str] = None
    security_reason: Optional[str] = None

class UrlService:
    """SSRF Security, DNS Resolution, Canonicalization, and URL Hashing Service."""

    @staticmethod
    def is_ip_private(ip_str: str) -> bool:
        """Check if an IP string belongs to private or link-local networks."""
        try:
            ip_obj = ipaddress.ip_address(ip_str)
            for net in BANNED_NETWORKS:
                if ip_obj in net:
                    return True
            return ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local
        except ValueError:
            return True

    @classmethod
    def validate_url(cls, url: str) -> Tuple[bool, Optional[str]]:
        """
        Validate URL scheme and resolve DNS to ensure target IP is not private or blocked.
        Returns (is_valid, error_message).
        """
        if not url or not isinstance(url, str):
            return False, "URL string is empty or invalid"

        cleaned_url = url.strip()
        parsed = urllib.parse.urlparse(cleaned_url)

        # 1. Scheme Check
        if parsed.scheme.lower() not in ALLOWED_SCHEMES:
            return False, f"Disallowed URL scheme '{parsed.scheme}'. Only http and https are permitted."

        hostname = parsed.hostname
        if not hostname:
            return False, "URL does not contain a valid hostname"

        # 2. Check if hostname itself is a raw IP
        try:
            raw_ip = ipaddress.ip_address(hostname)
            if cls.is_ip_private(str(raw_ip)):
                return False, f"Access to private/local IP address '{hostname}' is forbidden for SSRF security."
            return True, None
        except ValueError:
            pass  # Hostname is a domain name, proceed to DNS resolution

        # 3. DNS Resolution Protection
        try:
            addresses = socket.getaddrinfo(hostname, None)
            if not addresses:
                return False, f"DNS resolution failed for hostname '{hostname}'"

            resolved_ips: List[str] = list({addr[4][0] for addr in addresses if addr[4]})
            for ip in resolved_ips:
                if cls.is_ip_private(ip):
                    return False, f"Domain '{hostname}' resolved to private/blocked IP address '{ip}'. SSRF check failed."

            return True, None
        except socket.gaierror:
            return False, f"Could not resolve domain name '{hostname}'"
        except Exception as err:
            return False, f"DNS validation error for '{hostname}': {str(err)}"

    @classmethod
    def canonicalize_url(cls, url: str) -> str:
        """Strip tracking parameters and fragments to produce canonical URL."""
        parsed = urllib.parse.urlparse(url.strip())
        scheme = parsed.scheme.lower()
        netloc = parsed.netloc.lower()
        path = parsed.path.rstrip("/") if parsed.path != "/" else "/"

        # Preserve essential query parameters (like 'v' for YouTube) while stripping tracking parameters
        query = ""
        if parsed.query:
            query_params = urllib.parse.parse_qs(parsed.query, keep_blank_values=True)
            filtered_params = {
                k: v for k, v in query_params.items()
                if not k.startswith("utm_") and k not in {"fbclid", "gclid", "ref", "spm"}
            }
            if filtered_params:
                query = urllib.parse.urlencode(filtered_params, doseq=True)

        return urllib.parse.urlunparse((scheme, netloc, path, "", query, ""))

    @classmethod
    def hash_url(cls, canonical_url: str) -> str:
        """Generate SHA-256 hash string for canonicalized URL."""
        return hashlib.sha256(canonical_url.strip().encode("utf-8")).hexdigest()

    @classmethod
    async def validate_youtube_availability(cls, url: str) -> Tuple[bool, Optional[str]]:
        """Validate if a YouTube video URL is publicly available, playable, and NOT a short."""
        parsed = urllib.parse.urlparse(url.strip())
        url_lower = url.strip().lower()
        if "youtube.com" in parsed.netloc.lower() or "youtu.be" in parsed.netloc.lower():
            if "/shorts/" in parsed.path.lower() or "youtube.com/shorts" in url_lower:
                return False, "YouTube Shorts format is restricted. Only full long-form educational video lessons are permitted."

            if "watch" in parsed.path or "v=" in parsed.query or "youtu.be" in parsed.netloc:
                oembed_url = f"https://www.youtube.com/oembed?url={urllib.parse.quote(url)}&format=json"
                try:
                    async with httpx.AsyncClient(timeout=4.0) as client:
                        res = await client.get(oembed_url)
                        if res.status_code != 200:
                            return False, f"YouTube video is private, deleted, or unavailable (HTTP {res.status_code})."
                except Exception as e:
                    pass
        return True, None

    @classmethod
    async def validate_live_reachability(cls, url: str, timeout_seconds: float = 5.0) -> Tuple[bool, Optional[str]]:
        """Validate that non-YouTube external URL is live, reachable, and returns a 2xx/3xx HTTP status code."""
        parsed = urllib.parse.urlparse(url.strip())
        # YouTube URLs already checked via oEmbed
        if "youtube.com" in parsed.netloc.lower() or "youtu.be" in parsed.netloc.lower():
            return True, None

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ISML-AI-Resource-Fetcher/1.0"
        }

        try:
            async with httpx.AsyncClient(timeout=timeout_seconds, follow_redirects=True, verify=False) as client:
                try:
                    res = await client.head(url, headers=headers)
                    if res.status_code < 400:
                        return True, None
                except Exception:
                    pass

                res = await client.get(url, headers=headers)
                if res.status_code < 400:
                    return True, None
                else:
                    return False, f"External URL returned HTTP {res.status_code} status code (broken link / 404 Not Found)."
        except Exception as err:
            return False, f"External URL connection failed or timed out: {str(err)}"

    @classmethod
    async def validate_and_sanitize_url(cls, url: str) -> UrlValidationResult:
        """Full validation, sanitization, live status verification, domain extraction, and SHA-256 hashing."""
        is_valid, error_msg = cls.validate_url(url)
        if not is_valid:
            return UrlValidationResult(
                is_valid=False,
                security_reason=error_msg,
            )

        yt_valid, yt_error = await cls.validate_youtube_availability(url)
        if not yt_valid:
            return UrlValidationResult(
                is_valid=False,
                security_reason=yt_error,
            )

        live_valid, live_error = await cls.validate_live_reachability(url)
        if not live_valid:
            return UrlValidationResult(
                is_valid=False,
                security_reason=live_error,
            )

        canonical = cls.canonicalize_url(url)
        url_hash = cls.hash_url(canonical)
        parsed = urllib.parse.urlparse(canonical)

        return UrlValidationResult(
            is_valid=True,
            sanitized_url=canonical,
            url_hash=url_hash,
            domain=parsed.netloc,
        )

    @classmethod
    async def safe_fetch_url(cls, url: str, timeout_seconds: float = 10.0) -> Tuple[int, str, str]:
        """
        Safely fetch URL content with DNS validation on initial URL and on redirects.
        Returns (status_code, content_type, text_content).
        """
        is_valid, err = cls.validate_url(url)
        if not is_valid:
            raise SSRFSecurityError(err)

        async with httpx.AsyncClient(timeout=timeout_seconds, follow_redirects=False) as client:
            current_url = url
            max_redirects = 5

            for _ in range(max_redirects):
                valid, redirect_err = cls.validate_url(current_url)
                if not valid:
                    raise SSRFSecurityError(f"SSRF violation on redirect to '{current_url}': {redirect_err}")

                browser_headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.9,de;q=0.8,fr;q=0.7,ja;q=0.6",
                }
                resp = await client.get(current_url, headers=browser_headers)

                if resp.is_redirect or resp.status_code in (301, 302, 303, 307, 308):
                    location = resp.headers.get("Location")
                    if not location:
                        break
                    current_url = urllib.parse.urljoin(current_url, location)
                    continue

                content_type = resp.headers.get("content-type", "")
                return resp.status_code, content_type, resp.text

            raise SSRFSecurityError("Exceeded maximum redirect limit during safe fetch")

# Alias for compatibility
URLService = UrlService
