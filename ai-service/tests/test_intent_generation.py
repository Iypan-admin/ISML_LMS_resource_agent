import unittest
import asyncio
from app.agents.generation_agent import GenerationAgent
from app.models.requests import ResourceGenerationRequest

class TestIntentGeneration(unittest.TestCase):
    def setUp(self):
        self.agent = GenerationAgent()

    def test_case_13_tanglish_french_alphabets_soli_kudu_da(self):
        req = ResourceGenerationRequest(
            resource_type="Speaking",
            target_language="German",
            target_level="A1",
            topic="french alphabets soli kudu da",
            instructions="french alphabets soli kudu da"
        )
        res = asyncio.run(self.agent.generate(req))
        content = res.content
        self.assertEqual(res.target_language, "French")
        self.assertIn("French Alphabet", content)
        self.assertTrue("Bonjour" in content or "Arbre" in content or "வணக்கம்" in content)
        self.assertNotIn("Wir sprechen heute", content)

    def test_case_2_german_a1_speaking_practice(self):
        req = ResourceGenerationRequest(
            resource_type="Dialogue",
            target_language="German",
            target_level="A1",
            topic="German A1 speaking practice",
            instructions="German A1 speaking practice"
        )
        res = asyncio.run(self.agent.generate(req))
        content = res.content
        self.assertEqual(res.target_language, "German")
        self.assertIn("German", content)

    def test_case_3_french_numbers_in_tamil(self):
        req = ResourceGenerationRequest(
            resource_type="Full Study Guide",
            target_language="French",
            target_level="A1",
            topic="Explain French numbers 1 to 20 in Tamil",
            instructions="Explain French numbers 1 to 20 in Tamil"
        )
        res = asyncio.run(self.agent.generate(req))
        content = res.content
        self.assertEqual(res.target_language, "French")
        self.assertTrue("Tamil" in content or "எண்கள்" in content or "Un" in content or "French" in content)

    def test_case_4_five_questions_only(self):
        req = ResourceGenerationRequest(
            resource_type="Vocabulary",
            target_language="French",
            target_level="A1",
            topic="Give me 5 French alphabet questions only",
            instructions="Give me 5 French alphabet questions only"
        )
        res = asyncio.run(self.agent.generate(req))
        content = res.content
        self.assertTrue("1. Question" in content or "Question 1" in content or "1." in content)
        self.assertTrue("5. Question" in content or "Question 5" in content or "5." in content)

    def test_case_5_translate_good_morning(self):
        req = ResourceGenerationRequest(
            resource_type="Dialogue",
            target_language="French",
            target_level="A1",
            topic='Translate "Good morning" into French',
            instructions='Translate "Good morning" into French'
        )
        res = asyncio.run(self.agent.generate(req))
        content = res.content
        self.assertIn("Bonjour", content)
        # Verify expectation fix: "Bonjour" only, not "Bonmatin"
        self.assertNotIn("Bonmatin", content)

    def test_case_6_teach_me_french_alphabet(self):
        req = ResourceGenerationRequest(
            resource_type="Full Study Guide",
            target_language="French",
            target_level="A1",
            topic="Teach me French alphabet",
            instructions="Teach me French alphabet"
        )
        res = asyncio.run(self.agent.generate(req))
        content = res.content
        self.assertEqual(res.target_language, "French")
        self.assertNotIn("German Social Registers", content)

    def test_case_7_one_question_at_a_time(self):
        req = ResourceGenerationRequest(
            resource_type="Dialogue",
            target_language="French",
            target_level="A1",
            topic="one French alphabet question at a time",
            instructions="one French alphabet question at a time"
        )
        res = asyncio.run(self.agent.generate(req))
        content = res.content
        self.assertTrue("1. Question" in content or "Question 1" in content or "Question" in content)

    def test_case_8_french_alphabet_detailed_lesson(self):
        req = ResourceGenerationRequest(
            resource_type="Full Study Guide",
            target_language="French",
            target_level="A1",
            topic="French alphabet detailed lesson",
            instructions="French alphabet detailed lesson"
        )
        res = asyncio.run(self.agent.generate(req))
        content = res.content
        self.assertEqual(res.target_language, "French")

    def test_case_9_correct_french_sentence(self):
        req = ResourceGenerationRequest(
            resource_type="Grammar",
            target_language="French",
            target_level="A1",
            topic="correct this French sentence: Je suis aller au marché.",
            instructions="correct this French sentence: Je suis aller au marché."
        )
        res = asyncio.run(self.agent.generate(req))
        content = res.content
        self.assertTrue("Je suis allé" in content or "Correction" in content or "allé" in content)

    def test_case_10_twenty_french_travel_vocabulary_words(self):
        req = ResourceGenerationRequest(
            resource_type="Vocabulary",
            target_language="French",
            target_level="A1",
            topic="20 French travel vocabulary words",
            instructions="20 French travel vocabulary words"
        )
        res = asyncio.run(self.agent.generate(req))
        content = res.content
        self.assertIn("Vocabulary", content)

    def test_case_11_context_override(self):
        """Course context is German A1 Speaking, but user asks for French alphabet with Q&A.
        Explicit prompt MUST override course context."""
        req = ResourceGenerationRequest(
            resource_type="Speaking",
            target_language="German",
            target_level="A1",
            course="German A1 Speaking",
            topic="Teach me French alphabet with Q&A",
            instructions="Teach me French alphabet with Q&A"
        )
        res = asyncio.run(self.agent.generate(req))
        content = res.content
        self.assertEqual(res.target_language, "French")
        self.assertNotIn("German Social Registers", content)
        self.assertNotIn("Lukas:", content)

    def test_case_12_context_inheritance(self):
        """Course context is German A1 Speaking, user asks for today's lesson.
        No conflicting language in user prompt, so German A1 Speaking context is inherited."""
        req = ResourceGenerationRequest(
            resource_type="Speaking",
            target_language="German",
            target_level="A1",
            course="German A1 Speaking",
            topic="Teach me today's lesson",
            instructions="Teach me today's lesson"
        )
        res = asyncio.run(self.agent.generate(req))
        content = res.content
        self.assertEqual(res.target_language, "German")
        self.assertIn("German", content)

if __name__ == "__main__":
    unittest.main()
