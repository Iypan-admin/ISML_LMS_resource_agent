"""
Smart Deduplication Service for ISML Knowledge Intelligence Engine.

Provides:
1. SHA-256 exact content & URL fingerprinting
2. 64-bit SimHash calculation for near-duplicate text detection
3. Hamming distance calculation
4. Shingling & Token-based similarity metrics
"""
import hashlib
import re
from typing import List, Set, Tuple


class DedupService:
    """Multi-tiered deduplication service."""

    @staticmethod
    def calculate_sha256(text: str) -> str:
        """Returns standard hex SHA-256 of normalized text."""
        normalized = re.sub(r'\s+', ' ', text.strip().lower())
        return hashlib.sha256(normalized.encode('utf-8')).hexdigest()

    @staticmethod
    def _get_shingles(text: str, n: int = 3) -> List[str]:
        """Extracts character n-grams or word tokens for shingling."""
        clean_words = re.findall(r'\b\w+\b', text.lower())
        if len(clean_words) < n:
            return clean_words or [text.lower()]
        return [" ".join(clean_words[i:i + n]) for i in range(len(clean_words) - n + 1)]

    @classmethod
    def calculate_simhash_64(cls, text: str) -> str:
        """
        Computes 64-bit SimHash fingerprint for near-duplicate detection.
        Returns a 16-character hex string representing the 64-bit hash.
        """
        shingles = cls._get_shingles(text, n=3)
        if not shingles:
            return "0" * 16

        v = [0] * 64
        for shingle in shingles:
            # 64-bit hash using MD5 digest lower 8 bytes
            h = int(hashlib.md5(shingle.encode('utf-8')).hexdigest()[:16], 16)
            for i in range(64):
                bitmask = 1 << i
                if h & bitmask:
                    v[i] += 1
                else:
                    v[i] -= 1

        fingerprint = 0
        for i in range(64):
            if v[i] > 0:
                fingerprint |= (1 << i)

        return f"{fingerprint:016x}"

    @staticmethod
    def hamming_distance_simhash(hash1: str, hash2: str) -> int:
        """
        Calculates the bitwise Hamming distance between two 64-bit hex SimHashes.
        Distance <= 3 indicates near-duplicate content (>95% text overlap).
        """
        try:
            val1 = int(hash1, 16)
            val2 = int(hash2, 16)
            xor_val = val1 ^ val2
            return bin(xor_val).count('1')
        except ValueError:
            return 64

    @classmethod
    def is_near_duplicate(cls, hash1: str, hash2: str, max_distance: int = 3) -> bool:
        """Returns True if two SimHashes fall within near-duplicate distance threshold."""
        return cls.hamming_distance_simhash(hash1, hash2) <= max_distance

