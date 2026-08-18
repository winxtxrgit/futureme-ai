"""
common.py — โค้ดที่ใช้ร่วมกันในตัวอย่างทั้งหมด (config, embedding, vector store, LLM)

เป้าหมาย: ให้เห็น workflow ของ RAG ภาษาไทยอย่างชัดเจน โดยไม่ผูกกับ framework
ที่ API เปลี่ยนบ่อย ใช้ sentence-transformers + Chroma + เรียก LLM ผ่าน HTTP โดยตรง

โหลด config จากไฟล์ .env (ห้าม hardcode API key)
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

from dotenv import load_dotenv

load_dotenv()  # อ่านค่าจาก .env เข้าสู่ environment variables


@dataclass(frozen=True)
class Config:
    """รวม config ทั้งหมดไว้ที่เดียว อ่านจาก environment variables"""
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")
    chroma_path: str = os.getenv("CHROMA_PATH", "./chroma_db")
    chroma_collection: str = os.getenv("CHROMA_COLLECTION", "thai_docs")
    top_k: int = int(os.getenv("TOP_K", "4"))
    min_score: float = float(os.getenv("MIN_SCORE", "0.30"))
    llm_backend: str = os.getenv("LLM_BACKEND", "none").lower()
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model: str = os.getenv("OLLAMA_MODEL", "qwen2.5:7b-instruct")
    openai_base_url: str = os.getenv("OPENAI_BASE_URL", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "")
    temperature: float = float(os.getenv("TEMPERATURE", "0.1"))
    max_tokens: int = int(os.getenv("MAX_TOKENS", "512"))


CONFIG = Config()


# --------------------------------------------------------------------------- #
# Embedding
# --------------------------------------------------------------------------- #
_model_cache: dict[str, Any] = {}


def _is_e5(model_name: str) -> bool:
    """โมเดลตระกูล e5 ต้องใส่ prefix 'query:' / 'passage:' ก่อน encode"""
    return "e5" in model_name.lower()


def get_embedder():
    """โหลด embedding model (cache ไว้ไม่โหลดซ้ำ)"""
    from sentence_transformers import SentenceTransformer

    name = CONFIG.embedding_model
    if name not in _model_cache:
        try:
            _model_cache[name] = SentenceTransformer(name)
        except Exception as exc:  # โหลดโมเดลไม่ได้ (เน็ต/ชื่อผิด/พื้นที่ไม่พอ)
            raise RuntimeError(
                f"โหลด embedding model '{name}' ไม่สำเร็จ: {exc}\n"
                f"ตรวจสอบชื่อโมเดลใน .env และการเชื่อมต่ออินเทอร์เน็ต"
            ) from exc
    return _model_cache[name]


def embed_texts(texts: list[str], *, is_query: bool = False) -> list[list[float]]:
    """แปลงข้อความเป็นเวกเตอร์ (normalize เพื่อใช้ cosine similarity)"""
    if not texts:
        return []
    model = get_embedder()
    prepared = texts
    if _is_e5(CONFIG.embedding_model):
        prefix = "query: " if is_query else "passage: "
        prepared = [prefix + t for t in texts]
    vectors = model.encode(
        prepared,
        normalize_embeddings=True,  # ทำให้ dot product = cosine similarity
        show_progress_bar=False,
    )
    return [v.tolist() for v in vectors]


# --------------------------------------------------------------------------- #
# Vector store (Chroma)
# --------------------------------------------------------------------------- #
def get_collection():
    """เปิด/สร้าง collection ใน Chroma (persistent) ด้วย cosine distance"""
    import chromadb

    try:
        client = chromadb.PersistentClient(path=CONFIG.chroma_path)
        return client.get_or_create_collection(
            name=CONFIG.chroma_collection,
            metadata={"hnsw:space": "cosine"},
        )
    except Exception as exc:
        raise RuntimeError(
            f"เชื่อมต่อ Chroma ที่ '{CONFIG.chroma_path}' ไม่สำเร็จ: {exc}"
        ) from exc


# --------------------------------------------------------------------------- #
# LLM backend (Ollama / OpenAI-compatible / none)
# --------------------------------------------------------------------------- #
def call_llm(system_prompt: str, user_prompt: str) -> str:
    """
    เรียก LLM ตาม backend ที่ตั้งใน .env
    - 'ollama': เรียก Ollama local ผ่าน HTTP
    - 'openai_compatible': เรียก endpoint ที่รองรับ OpenAI Chat Completions
    - 'none': ไม่เรียกโมเดล (คืนข้อความแจ้งเตือน — เหมาะดู pipeline โดยไม่ต้องมี LLM)
    """
    import requests

    backend = CONFIG.llm_backend
    if backend == "none":
        return "[LLM_BACKEND=none] ไม่ได้เรียกโมเดล — ดู context/citation ที่ retrieve ได้ด้านบน"

    try:
        if backend == "ollama":
            resp = requests.post(
                f"{CONFIG.ollama_base_url}/api/chat",
                json={
                    "model": CONFIG.ollama_model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "stream": False,
                    "options": {"temperature": CONFIG.temperature},
                },
                timeout=120,
            )
            resp.raise_for_status()
            return resp.json()["message"]["content"].strip()

        if backend == "openai_compatible":
            if not CONFIG.openai_base_url or not CONFIG.openai_model:
                raise RuntimeError("ต้องตั้ง OPENAI_BASE_URL และ OPENAI_MODEL ใน .env")
            headers = {"Content-Type": "application/json"}
            if CONFIG.openai_api_key:
                headers["Authorization"] = f"Bearer {CONFIG.openai_api_key}"
            resp = requests.post(
                f"{CONFIG.openai_base_url}/chat/completions",
                headers=headers,
                json={
                    "model": CONFIG.openai_model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": CONFIG.temperature,
                    "max_tokens": CONFIG.max_tokens,
                },
                timeout=120,
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"].strip()

        raise RuntimeError(f"ไม่รู้จัก LLM_BACKEND='{backend}'")

    except requests.exceptions.ConnectionError as exc:
        raise RuntimeError(
            f"เชื่อมต่อ LLM backend '{backend}' ไม่ได้ — โมเดลรันอยู่หรือไม่? ({exc})"
        ) from exc
    except Exception as exc:
        raise RuntimeError(f"เรียก LLM ล้มเหลว: {exc}") from exc
