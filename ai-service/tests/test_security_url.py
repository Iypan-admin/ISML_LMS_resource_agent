import unittest
import asyncio
from app.services.url_service import UrlService

class TestUrlSecurityService(unittest.TestCase):
    def setUp(self):
        self.service = UrlService()

    def test_ssrf_blocked_ips_and_hosts(self):
        blocked_urls = [
            "http://127.0.0.1/admin",
            "http://localhost/secret",
            "http://169.254.169.254/latest/meta-data/",
            "http://10.0.0.5/private",
            "http://192.168.1.1/router",
            "ftp://example.com/file",
            "file:///etc/passwd",
        ]
        for url in blocked_urls:
            res = asyncio.run(self.service.validate_and_sanitize_url(url))
            self.assertFalse(res.is_valid, f"Should have blocked SSRF URL: {url}")
            self.assertIsNotNone(res.security_reason)

    def test_valid_public_url(self):
        valid_url = "https://www.schubert-verlag.de/aufgaben/?ref=test#section1"
        res = asyncio.run(self.service.validate_and_sanitize_url(valid_url))
        self.assertTrue(res.is_valid, f"Validation failed: {res.security_reason}")
        self.assertEqual(res.sanitized_url, "https://www.schubert-verlag.de/aufgaben")
        self.assertIsNotNone(res.url_hash)
        self.assertEqual(len(res.url_hash), 64) # SHA-256 hex length

    def test_url_hash_consistency(self):
        url1 = "https://www.schubert-verlag.de/aufgaben/?utm_source=google&utm_medium=cpc"
        url2 = "https://www.schubert-verlag.de/aufgaben/?utm_source=facebook&fbclid=xyz"
        h1 = self.service.hash_url(self.service.canonicalize_url(url1))
        h2 = self.service.hash_url(self.service.canonicalize_url(url2))
        self.assertEqual(h1, h2, "Canonicalized URLs should yield identical SHA-256 hash regardless of tracking params")

if __name__ == "__main__":
    unittest.main()
