"""
Pure-Python replacement for uuid_utils package.
"""
import uuid as _std_uuid

MAX = _std_uuid.UUID("ffffffff-ffff-ffff-ffff-ffffffffffff")
NIL = _std_uuid.UUID("00000000-0000-0000-0000-000000000000")
NAMESPACE_DNS = _std_uuid.NAMESPACE_DNS
NAMESPACE_OID = _std_uuid.NAMESPACE_OID
NAMESPACE_URL = _std_uuid.NAMESPACE_URL
NAMESPACE_X500 = _std_uuid.NAMESPACE_X500
RESERVED_FUTURE = _std_uuid.RESERVED_FUTURE
RESERVED_MICROSOFT = _std_uuid.RESERVED_MICROSOFT
RESERVED_NCS = _std_uuid.RESERVED_NCS
RFC_4122 = _std_uuid.RFC_4122
UUID = _std_uuid.UUID
__version__ = "0.9.0"

getnode = _std_uuid.getnode

def uuid1(*args, **kwargs): return _std_uuid.uuid1()
def uuid3(*args, **kwargs): return _std_uuid.uuid3(_std_uuid.NAMESPACE_DNS, "mock")
def uuid4(*args, **kwargs): return _std_uuid.uuid4()
def uuid5(*args, **kwargs): return _std_uuid.uuid5(_std_uuid.NAMESPACE_DNS, "mock")
def uuid6(*args, **kwargs): return _std_uuid.uuid1()
def uuid7(*args, **kwargs): return _std_uuid.uuid4()
def uuid8(*args, **kwargs): return _std_uuid.uuid4()

def reseed_rng(): pass

class SafeUUID: pass

__all__ = [
    "MAX", "NIL", "NAMESPACE_DNS", "NAMESPACE_OID", "NAMESPACE_URL", "NAMESPACE_X500",
    "RESERVED_FUTURE", "RESERVED_MICROSOFT", "RESERVED_NCS", "RFC_4122", "UUID",
    "__version__", "getnode", "uuid1", "uuid3", "uuid4", "uuid5", "uuid6", "uuid7", "uuid8",
    "reseed_rng", "SafeUUID"
]

