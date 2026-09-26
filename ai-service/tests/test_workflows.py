import unittest
import asyncio
from app.models.requests import ResourceAnalysisRequest, ResourceDiscoveryRequest, ResourceGenerationRequest
from app.workflows.analyze_resource import AnalyzeResourceWorkflow
from app.workflows.discover_resources import DiscoverResourcesWorkflow
from app.workflows.generate_resource import GenerateResourceWorkflow
from app.workflows.review_preparation import ReviewPreparationWorkflow

class TestWorkflows(unittest.TestCase):
    def test_analyze_resource_workflow(self):
        wf = AnalyzeResourceWorkflow()
        req = ResourceAnalysisRequest(
            text_content="Guten Tag! Ich heiße Anna und ich lerne Deutsch. Das ist Niveau A1.",
            known_language_code="de",
            known_level_code="A1",
        )
        res = asyncio.run(wf.run(req))
        self.assertTrue(res["success"])
        self.assertEqual(res["analysis"]["detected_language"], "de")
        self.assertEqual(res["analysis"]["detected_cefr"], "A1")
        self.assertTrue(res["requires_human_review"])

    def test_discover_resources_workflow(self):
        wf = DiscoverResourcesWorkflow()
        req = ResourceDiscoveryRequest(
            search_keywords="German A1 Greetings",
            target_languages=["de"],
            target_levels=["A1"],
            limit=3,
        )
        res = asyncio.run(wf.run(req))
        self.assertGreater(res["discovered_count"], 0)
        self.assertTrue(res["requires_human_review"])

    def test_generate_resource_workflow(self):
        wf = GenerateResourceWorkflow()
        req = ResourceGenerationRequest(
            resource_type="DIALOGUE",
            target_language="German",
            target_level="A1",
            topic="Ordering Coffee",
        )
        res = asyncio.run(wf.run(req))
        self.assertTrue(res["success"])
        self.assertEqual(res["generated_resource"]["target_level"], "A1")
        self.assertTrue(res["requires_human_review"])

    def test_review_preparation_workflow(self):
        wf = ReviewPreparationWorkflow()
        analysis_data = {
            "analysis": {
                "title": "German A1 Vocabulary List",
                "description": "Essential German vocabulary for beginners.",
                "detected_language": "de",
                "detected_cefr": "A1",
            },
            "domain_classification": {
                "language_id": "lang-de-id",
                "resource_type": "ARTICLE",
                "level_id": "lvl-a1-id",
                "category_ids": ["cat-vocab-id"],
            },
            "url_security": {
                "sanitized_url": "https://example.com/german-vocab",
            },
            "quality": {"overall": {"score": 85}},
            "copyright": {"risk_level": "LOW_CONCERN"},
        }
        res = asyncio.run(wf.prepare_for_review(analysis_data))
        self.assertEqual(res["resource_payload"]["status"], "PENDING_REVIEW")
        self.assertEqual(res["resource_payload"]["languageId"], "lang-de-id")
        self.assertTrue(res["validation_status"]["requires_human_review"])

if __name__ == "__main__":
    unittest.main()
