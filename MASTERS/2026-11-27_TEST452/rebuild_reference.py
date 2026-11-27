#!/usr/bin/env python3
"""Rebuild the TEST452 reference launcher for the ORIGINAL TEST92 corpus order.
No D81 is created; selected-playlist exports require their own fade-map remap.
"""
from pathlib import Path
import hashlib
here=Path(__file__).resolve().parent
def git_blob(b):
    return hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
p=(here/"SIDPLAY64MIX_TEST94_BASE.prg").read_bytes()
assert hashlib.sha256(p).hexdigest()=="412319b4a2b96dfe9a5ffc47d46bde55d6a08d5f8524af80d5d7e83eae427f7f"
assert p[13337:13340]==bytes.fromhex("4c1108") and p[14755:14758]==bytes.fromhex("4c5742")
# Identity order: same 100-entry fade map and nine high-address indices.
assert list(p[13607:13616])==sorted(set(p[13607:13616]))
q=bytearray(p)+bytearray(15288-len(p))
q[13338:13340]=bytes.fromhex("a542")
q[14756:14758]=bytes.fromhex("00eb")
for offset,h in [(15014,"0848a200bdb7429d00ebe8d0f768284c1108"),(15032,"a200bd30eb9d4541e8e04bd0f5a9208dca308d1a3aa9458dcb30a9568d1b3aa9418dcc308d1c3a4c5742"),(15080,"088a48a687a58620694168aa28ad013060088a48ae7b3ead7a3e20694168aa28ad0b3e60488a4a4a4a4a09308d16018a290f09308d170168484a4a4a4a09308d190168290f09308d1a0160")]:
    b=bytes.fromhex(h)
    q[offset:offset+len(b)]=b
assert q[14758:15014]==p[14758:15014]
assert git_blob(q)=="bc85d91b0afb93558aab8dbe1d97bd8afa6f8596"
assert q==(here/"SIDPLAY64MIX_TEST452_REFERENCE.prg").read_bytes()
print("PASS",len(q),hashlib.sha256(q).hexdigest())
