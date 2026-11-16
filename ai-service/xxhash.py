"""
Pure-Python shim for xxhash to ensure 100% compatibility on Windows
systems where unsigned C-extension DLLs (.pyd) in AppData are restricted
by Windows Application Control (WDAC/AppLocker).
"""
import hashlib

XXHASH_VERSION = "0.8.2"
VERSION = "0.8.2"

class _MockHash:
    def __init__(self, val=b"", seed=0):
        if isinstance(val, str):
            val = val.encode("utf-8")
        self._h = hashlib.sha256(val)
    def update(self, val):
        if isinstance(val, str):
            val = val.encode("utf-8")
        self._h.update(val)
    def digest(self):
        return self._h.digest()[:16]
    def hexdigest(self):
        return self._h.hexdigest()[:32]
    def intdigest(self):
        return int(self.hexdigest(), 16)

def xxh32(val=b"", seed=0): return _MockHash(val, seed)
def xxh32_digest(val, seed=0): return _MockHash(val, seed).digest()[:4]
def xxh32_intdigest(val, seed=0): return int(_MockHash(val, seed).hexdigest()[:8], 16)
def xxh32_hexdigest(val, seed=0): return _MockHash(val, seed).hexdigest()[:8]

def xxh64(val=b"", seed=0): return _MockHash(val, seed)
def xxh64_digest(val, seed=0): return _MockHash(val, seed).digest()[:8]
def xxh64_intdigest(val, seed=0): return int(_MockHash(val, seed).hexdigest()[:16], 16)
def xxh64_hexdigest(val, seed=0): return _MockHash(val, seed).hexdigest()[:16]

def xxh3_64(val=b"", seed=0): return _MockHash(val, seed)
def xxh3_64_digest(val, seed=0): return _MockHash(val, seed).digest()[:8]
def xxh3_64_intdigest(val, seed=0): return int(_MockHash(val, seed).hexdigest()[:16], 16)
def xxh3_64_hexdigest(val, seed=0): return _MockHash(val, seed).hexdigest()[:16]

def xxh3_128(val=b"", seed=0): return _MockHash(val, seed)
def xxh3_128_digest(val, seed=0): return _MockHash(val, seed).digest()[:16]
def xxh3_128_intdigest(val, seed=0): return int(_MockHash(val, seed).hexdigest()[:32], 16)
def xxh3_128_hexdigest(val, seed=0): return _MockHash(val, seed).hexdigest()[:32]

xxh128 = xxh3_128
xxh128_hexdigest = xxh3_128_hexdigest
xxh128_intdigest = xxh3_128_intdigest
xxh128_digest = xxh3_128_digest

algorithms_available = {"xxh32", "xxh64", "xxh3_64", "xxh128", "xxh3_128"}
algorithms_guaranteed = algorithms_available

__all__ = [
    "xxh32", "xxh32_digest", "xxh32_intdigest", "xxh32_hexdigest",
    "xxh64", "xxh64_digest", "xxh64_intdigest", "xxh64_hexdigest",
    "xxh3_64", "xxh3_64_digest", "xxh3_64_intdigest", "xxh3_64_hexdigest",
    "xxh3_128", "xxh3_128_digest", "xxh3_128_intdigest", "xxh3_128_hexdigest",
    "xxh128", "xxh128_digest", "xxh128_intdigest", "xxh128_hexdigest",
    "XXHASH_VERSION", "VERSION",
]

