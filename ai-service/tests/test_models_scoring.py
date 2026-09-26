import unittest
from pydantic import ValidationError
from app.models.scoring import ScoreModel
from app.models.requests import ResourceAnalysisRequest, ResourceDiscoveryRequest

class TestModelsAndScoring(unittest.TestCase):
    def test_score_model_valid(self):
        sm = ScoreModel(
            score=85,
            score_basis="Verified against CEFR guidelines",
            evidence=["Contains A1 vocabulary"],
            confidence="HIGH",
        )
        self.assertEqual(sm.score, 85)
        self.assertEqual(sm.confidence, "HIGH")

    def test_score_model_out_of_bounds(self):
        with self.assertRaises(ValidationError):
            ScoreModel(
                score=150, # Invalid score > 100
                score_basis="Invalid score",
                evidence=[],
                confidence="HIGH",
            )

    def test_request_models(self):
        req = ResourceAnalysisRequest(
            text_content="Das ist ein schöner Tag in Deutschland.",
            known_language_code="de",
            known_level_code="A1",
        )
        self.assertEqual(req.known_language_code, "de")
        self.assertEqual(req.known_level_code, "A1")

if __name__ == "__main__":
    unittest.main()
