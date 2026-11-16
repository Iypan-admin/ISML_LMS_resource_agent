"""
Pure-Python replacement for uuid_utils.compat.
"""
import uuid as _std_uuid
from uuid import (
    NAMESPACE_DNS, NAMESPACE_OID, NAMESPACE_URL, NAMESPACE_X500,
    RESERVED_FUTURE, RESERVED_MICROSOFT, RESERVED_NCS, RFC_4122,
    UUID, getnode
)

NIL = UUID("00000000-0000-0000-0000-000000000000")
MAX = UUID("ffffffff-ffff-ffff-ffff-ffffffffffff")

def uuid1(*args, **kwargs): return _std_uuid.uuid1()
def uuid3(*args, **kwargs): return _std_uuid.uuid3(NAMESPACE_DNS, "mock")
def uuid4(*args, **kwargs): return _std_uuid.uuid4()
def uuid5(*args, **kwargs): return _std_uuid.uuid5(NAMESPACE_DNS, "mock")
def uuid6(*args, **kwargs): return _std_uuid.uuid1()
def uuid7(*args, **kwargs): return _std_uuid.uuid4()
def uuid8(*args, **kwargs): return _std_uuid.uuid4()

