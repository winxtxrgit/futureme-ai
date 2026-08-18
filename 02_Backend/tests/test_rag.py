import pytest
from app.rag import RAGPipeline
from scripts.generate_qwen_dataset import generate_qwen_qlora_dataset, validate_dataset_schema


def test_rag_recall_at_20_benchmark():
    rag = RAGPipeline()
    eval_set = [
        {"query": "หลักสูตร ปวช. 2567 สอศ. 12 กลุ่มสาขา", "expected_doc_ids": ["doc_ovec_12"]},
        {"query": "คะแนน TPAT1 TPAT2 TPAT3 TPAT4 TPAT5 TCAS", "expected_doc_ids": ["doc_tcas_tpat"]},
        {"query": "การศึกษาระบบทวิภาคี DVE เรียนคู่ฝึกงาน", "expected_doc_ids": ["doc_dve_dual"]},
        {"query": "สถิติแรงงาน TDRI WEF 2025 39%", "expected_doc_ids": ["doc_tdri_stats"]},
        {"query": "สายงานดิจิทัล ซอฟต์แวร์ AI", "expected_doc_ids": ["doc_stem_careers"]},
    ]
    recall = rag.evaluate_recall_at_k(eval_set, k=20)
    assert recall >= 0.90, f"Recall@20 was {recall}, expected >= 0.90"


def test_rag_grounded_claim_accuracy_benchmark():
    rag = RAGPipeline()
    claims_set = [
        {"claim": "หลักสูตร ปวช. 2567 แบ่งเป็น 12 กลุ่มสาขาวิชาหลัก", "expected_fact": ["สอศ", "12 กลุ่มสาขา", "ปวช"]},
        {"claim": "การสอบ TCAS ใช้คะแนน TPAT1-5", "expected_fact": ["tpas", "tcas", "ทปอ", "ความถนัด"]},
        {"claim": "การเรียนทวิภาคีฝึกงานในสถานประกอบการจริง", "expected_fact": ["ทวิภาคี", "สอศ", "สถานประกอบการ"]},
        {"claim": "รายงาน WEF 2025 คาดการณ์การปรับเปลี่ยนทักษะแรงงาน 39%", "expected_fact": ["wef", "tdri", "2025", "39%"]},
        {"claim": "สายงานดิจิทัลและซอฟต์แวร์เน้นทักษะการเขียนโปรแกรม", "expected_fact": ["ซอฟต์แวร์", "ไอที", "ดิจิทัล"]},
    ]
    accuracy = rag.evaluate_grounded_claim_accuracy(claims_set)
    assert accuracy >= 0.95, f"Grounded claim accuracy was {accuracy}, expected >= 0.95"


def test_qwen_qlora_dataset_schema_validity():
    dataset_path = generate_qwen_qlora_dataset("data/test_qwen_qlora.jsonl")
    validity = validate_dataset_schema(dataset_path)
    assert validity >= 0.98, f"QLoRA schema validity was {validity}, expected >= 0.98"
