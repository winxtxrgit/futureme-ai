"""
vector_search_example.py — ค้นเอกสารจาก Vector Database (Retrieval เฟส)

แสดงหัวใจของ retrieval: embed คำถาม → ค้น top-k → คืนผลพร้อม "คะแนนความคล้าย"
และจัดการกรณี "ไม่พบข้อมูล" (คะแนนต่ำกว่าเกณฑ์ MIN_SCORE)

รัน (ต้อง ingest ก่อน):
    python vector_search_example.py "ค่าเบี้ยเลี้ยงเดินทางในประเทศต่อวันเท่าไหร่"
"""
from __future__ import annotations

import sys
from dataclasses import dataclass
from typing import Any

from common import CONFIG, embed_texts, get_collection


@dataclass
class RetrievedChunk:
    """ผลการค้น 1 ชิ้น พร้อมคะแนนและ metadata สำหรับทำ citation"""
    text: str
    score: float  # cosine similarity 0-1 (ยิ่งสูงยิ่งเกี่ยว)
    metadata: dict[str, Any]


def search(query: str, top_k: int | None = None, access_levels: list[str] | None = None) -> list[RetrievedChunk]:
    """
    ค้น chunk ที่เกี่ยวข้องกับคำถาม
    - top_k: จำนวนผลลัพธ์ (ดีฟอลต์จาก .env)
    - access_levels: กรองตามสิทธิ์ (document-level permission) — ดู 11_Security...
    """
    if not query or not query.strip():
        raise ValueError("คำถามว่างเปล่า")

    top_k = top_k or CONFIG.top_k
    collection = get_collection()

    if collection.count() == 0:
        raise RuntimeError(
            "collection ว่างเปล่า — รัน `python document_ingestion_example.py` ก่อน"
        )

    query_vec = embed_texts([query], is_query=True)[0]

    # กรองสิทธิ์ที่ชั้น retrieval (ให้เห็นเฉพาะเอกสารที่มีสิทธิ์)
    where = {"access_level": {"$in": access_levels}} if access_levels else None

    try:
        result = collection.query(
            query_embeddings=[query_vec],
            n_results=top_k,
            where=where,
            include=["documents", "metadatas", "distances"],
        )
    except Exception as exc:
        raise RuntimeError(f"ค้น Chroma ล้มเหลว: {exc}") from exc

    docs = result.get("documents", [[]])[0]
    metas = result.get("metadatas", [[]])[0]
    dists = result.get("distances", [[]])[0]

    chunks: list[RetrievedChunk] = []
    for text, meta, dist in zip(docs, metas, dists):
        # Chroma cosine distance = 1 - cosine similarity → แปลงกลับเป็น similarity
        score = 1.0 - float(dist)
        chunks.append(RetrievedChunk(text=text, score=score, metadata=meta or {}))
    return chunks


def search_with_threshold(query: str, **kwargs: Any) -> tuple[list[RetrievedChunk], bool]:
    """
    ค้นแล้วกรองด้วย MIN_SCORE
    คืน (chunks ที่ผ่านเกณฑ์, found) — found=False แปลว่าควรตอบ "ไม่พบข้อมูล"
    """
    results = search(query, **kwargs)
    passed = [c for c in results if c.score >= CONFIG.min_score]
    return passed, bool(passed)


def _format_citation(meta: dict[str, Any]) -> str:
    src = meta.get("source_file", "ไม่ทราบแหล่ง")
    page = meta.get("page", "-")
    section = meta.get("section", "")
    return f"{src} หน้า {page}" + (f" ({section})" if section else "")


def main() -> None:
    query = sys.argv[1] if len(sys.argv) > 1 else "ค่าเบี้ยเลี้ยงเดินทางในประเทศต่อวันเท่าไหร่"
    print(f"❓ คำถาม: {query}\n")

    try:
        chunks, found = search_with_threshold(query)
    except (ValueError, RuntimeError) as exc:
        print(f"❌ {exc}")
        raise SystemExit(1)

    if not found:
        print(f"🔍 ไม่พบเอกสารที่เกี่ยวข้อง (คะแนนต่ำกว่าเกณฑ์ {CONFIG.min_score})")
        print("→ ระบบควรตอบผู้ใช้ว่า: \"ไม่พบข้อมูลในเอกสาร\"")
        return

    print(f"พบ {len(chunks)} chunk ที่เกี่ยวข้อง:\n")
    for i, c in enumerate(chunks, 1):
        print(f"[{i}] score={c.score:.3f}  แหล่ง: {_format_citation(c.metadata)}")
        preview = c.text[:120] + ("..." if len(c.text) > 120 else "")
        print(f"    {preview}\n")


if __name__ == "__main__":
    main()
