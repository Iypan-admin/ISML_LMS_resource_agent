import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestHttpContractIntegration(unittest.TestCase):
    """Real HTTP API Contract Verification Test Suite."""

    def setUp(self):
        self.client = TestClient(app)

    def test_health_http(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")

    def test_ready_http(self):
        res = self.client.get("/ready")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "ready")

    def test_analyze_http(self):
        payload = {
            "text_content": "Das ist ein Beispieltext für Deutsch A1 Lernen.",
            "known_language_code": "de",
            "known_level_code": "A1"
        }
        res = self.client.post("/api/v1/ai/analyze", json=payload)
        self.assertEqual(res.status_code, 200)
        json_resp = res.json()
        self.assertTrue(json_resp["success"])
        self.assertIn("analysis", json_resp["data"])
        self.assertTrue(json_resp["data"]["requires_human_review"])

    def test_discover_http(self):
        payload = {
            "search_keywords": "German A1 Vocabulary",
            "target_languages": ["de"],
            "target_levels": ["A1"],
            "limit": 2
        }
        res = self.client.post("/api/v1/ai/discover", json=payload)
        self.assertEqual(res.status_code, 200)
        json_resp = res.json()
        self.assertTrue(json_resp["success"])
        self.assertIn("candidates", json_resp["data"])
        self.assertTrue(json_resp["data"]["requires_human_review"])

    def test_generate_http(self):
        payload = {
            "resource_type": "DIALOGUE",
            "target_language": "German",
            "target_level": "A1",
            "topic": "Ordering Food",
            "instructions": "Keep dialogue under 6 turns."
        }
        res = self.client.post("/api/v1/ai/generate", json=payload)
        self.assertEqual(res.status_code, 200)
        json_resp = res.json()
        self.assertTrue(json_resp["success"])
        self.assertIn("generated_resource", json_resp["data"])
        self.assertTrue(json_resp["data"]["requires_human_review"])

    def test_prepare_review_http(self):
        payload = {
            "analysis": {
                "title": "German A1 Food Vocabulary",
                "description": "Food vocabulary for beginners.",
                "detected_language": "de",
                "detected_cefr": "A1"
            },
            "domain_classification": {
                "language_id": "lang-de",
                "resource_type": "ARTICLE",
                "level_id": "lvl-a1"
            },
            "url_security": {"sanitized_url": "https://example.com/food"},
            "quality": {"overall": {"score": 88}},
            "copyright": {"risk_level": "LOW_CONCERN"}
        }
        res = self.client.post("/api/v1/ai/prepare-review", json=payload)
        self.assertEqual(res.status_code, 200)
        json_resp = res.json()
        self.assertTrue(json_resp["success"])
        self.assertEqual(json_resp["data"]["resource_payload"]["status"], "PENDING_REVIEW")
        self.assertTrue(json_resp["data"]["validation_status"]["requires_human_review"])

if __name__ == "__main__":
    unittest.main()
