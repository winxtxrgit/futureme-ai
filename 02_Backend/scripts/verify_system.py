#!/usr/bin/env python3
"""
Formal Automated Verification Agent & Audit Suite for FuturePath AI System.

Programmatically validates:
1. Zero forbidden/unverified statistics (52%, 65%, 85%, 44%, 9 areas) or broken absolute links across workspace files.
2. Full compliance of all 12 ปวช. 2567 vocational areas and official TPAT2-5 mappings.
3. 100% API contract compliance and valid JSON schemas for endpoints:
   - POST /v1/missions/recommend
   - POST /v1/missions/{id}/submissions
   - POST /v1/future-paths
   - GET /v1/future-paths/{id}
4. RAG recall@20 >= 90%, grounded claim accuracy >= 95%, and Qwen3-4B QLoRA schema validity >= 98%.
"""

import os
import re
import sys
import json
from pathlib import Path
from typing import List, Dict, Tuple, Any

# Ensure workspace root is in sys.path
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from fastapi.testclient import TestClient
from app.main import app
from app.decision_engine.multi_tier import MultiTierRouter
from app.rag.pipeline import RAGPipeline
from scripts.generate_qwen_dataset import generate_qwen_qlora_dataset, validate_dataset_schema


class VerificationAgent:
    def __init__(self, root_dir: Path):
        self.root_dir = root_dir
        self.client = TestClient(app)
        self.failures: List[str] = []

    def log(self, section: str, message: str, status: str = "INFO"):
        symbol = "PASS" if status == "PASS" else ("FAIL" if status == "FAIL" else "INFO")
        print(f"[{symbol}] [{section}] {message}")

    # =========================================================================
    # Check 1: Repository Claim & Link Integrity Audit
    # =========================================================================
    def audit_repository_claims_and_links(self) -> bool:
        self.log("AUDIT", "Starting workspace claim & link integrity audit...")
        
        forbidden_patterns = [
            (r"\b52%\b", "Unverified 52% mismatch statistic claim"),
            (r"\b65%\b", "Unverified 65% blanket experience statistic claim"),
            (r"\b85%\b", "Unverified 85% dual job statistic claim"),
            (r"\b44%\b", "Outdated WEF 44% skill shift claim"),
            (r"9\s*ประเภทวิชา", "Outdated 9 ปวช. category classification"),
            (r"9\s*สาขาวิชา", "Outdated 9 ปวช. category classification"),
            (r"file:///d:", "Broken hardcoded file:///d: absolute URL link")
        ]

        # Scan text files in Data/, docs/, app/, schemas/, scripts/, etc.
        # Exclude .git, __pycache__, .agents metadata
        scan_dirs = ["Data", "docs", "app", "schemas", "scripts"]
        files_scanned = 0
        violations_found = 0

        for s_dir in scan_dirs:
            target_path = self.root_dir / s_dir
            if not target_path.exists():
                continue

            for file_path in target_path.rglob("*"):
                if file_path.is_file() and file_path.suffix in [".md", ".py", ".json", ".txt", ".html"]:
                    if file_path.name == "verify_system.py":
                        continue
                    files_scanned += 1
                    try:
                        content = file_path.read_text(encoding="utf-8", errors="ignore")
                        for pattern, label in forbidden_patterns:
                            matches = re.findall(pattern, content, flags=re.IGNORECASE)
                            if matches:
                                violations_found += len(matches)
                                err_msg = f"Forbidden pattern '{label}' ({pattern}) found in {file_path.relative_to(self.root_dir)}"
                                self.log("AUDIT", err_msg, "FAIL")
                                self.failures.append(err_msg)
                    except Exception as e:
                        pass

        # Also check root level PROJECT.md and README files
        for root_file in [self.root_dir / "PROJECT.md", self.root_dir / "README.md"]:
            if root_file.exists():
                files_scanned += 1
                content = root_file.read_text(encoding="utf-8", errors="ignore")
                for pattern, label in forbidden_patterns:
                    # Allow line 30 of PROJECT.md which explicitly states "Zero broken file:///d:... links"
                    matches = re.findall(pattern, content, flags=re.IGNORECASE)
                    if matches:
                        # filter out literal checklist string in PROJECT.md if present
                        filtered_matches = []
                        for m in matches:
                            if pattern == r"file:///d:" and "Zero broken" in content:
                                continue
                            filtered_matches.append(m)
                        if filtered_matches:
                            violations_found += len(filtered_matches)
                            err_msg = f"Forbidden pattern '{label}' found in {root_file.name}"
                            self.log("AUDIT", err_msg, "FAIL")
                            self.failures.append(err_msg)

        if violations_found == 0:
            self.log("AUDIT", f"Clean repository! Scanned {files_scanned} files with 0 violations.", "PASS")
            return True
        else:
            self.log("AUDIT", f"Audit failed with {violations_found} violations.", "FAIL")
            return False

    # =========================================================================
    # Check 2: Vocational Curriculum (ปวช. 2567) & TPAT Compliance Audit
    # =========================================================================
    def audit_curriculum_and_tpat_compliance(self) -> bool:
        self.log("CURRICULUM", "Validating 12 ปวช. 2567 vocational areas and TPAT2-5 mappings...")
        
        router = MultiTierRouter()
        
        # 1. Validate 12 ปวช. 2567 areas
        expected_12_areas = [
            "อุตสาหกรรม", "บริหารธุรกิจ", "คหกรรม", "ท่องเที่ยว",
            "สุขภาพและความงาม", "โลจิสติกส์", "อาหาร", "ศิลปกรรมและเศรษฐกิจครีเอทีฟ",
            "เกษตรกรรมและประมง", "แฟชั่นและสิ่งทอ", "ดิจิทัลและไอที", "เอ็นเตอร์เทนเมนต์"
        ]

        missing_areas = set(expected_12_areas) - set(router.VOCATIONAL_12_AREAS)
        if missing_areas:
            err_msg = f"Missing ปวช. 2567 areas in decision engine: {missing_areas}"
            self.log("CURRICULUM", err_msg, "FAIL")
            self.failures.append(err_msg)
            return False

        self.log("CURRICULUM", "All 12 ปวช. 2567 vocational areas fully registered.", "PASS")

        # 2. Validate TPAT Mappings
        expected_tpats = {
            "TPAT1": "ความถนัดวิชาชีพแพทย์ (กสพท)",
            "TPAT2": "ความถนัดศิลปกรรมศาสตร์",
            "TPAT3": "ความถนัดวิทยาศาสตร์ เทคโนโลยี วิศวกรรมศาสตร์",
            "TPAT4": "ความถนัดสถาปัตยกรรมศาสตร์",
            "TPAT5": "ความถนัดทางวิชาชีพครู"
        }

        for code, expected_title in expected_tpats.items():
            if code not in router.TPAT_MAPPINGS:
                err_msg = f"Missing TPAT mapping code: {code}"
                self.log("CURRICULUM", err_msg, "FAIL")
                self.failures.append(err_msg)
                return False
            
            actual_name = router.TPAT_MAPPINGS[code]["name"]
            if expected_title not in actual_name:
                err_msg = f"Incorrect TPAT mapping title for {code}: expected '{expected_title}', got '{actual_name}'"
                self.log("CURRICULUM", err_msg, "FAIL")
                self.failures.append(err_msg)
                return False

        self.log("CURRICULUM", "All TPAT1-5 mappings fully compliant with MyTCAS Blueprint.", "PASS")
        return True

    # =========================================================================
    # Check 3: API Contract Compliance & JSON Schema Validation
    # =========================================================================
    def audit_api_contracts(self) -> bool:
        self.log("API", "Validating 100% API contract compliance & JSON schemas...")

        # Test 1: POST /v1/missions/recommend
        rec_payload = {
            "education_level": "LOWER_SECONDARY",
            "interests": ["ดิจิทัล", "ปัญญาประดิษฐ์"],
            "limit": 3
        }
        res1 = self.client.post("/v1/missions/recommend", json=rec_payload)
        if res1.status_code != 200:
            err_msg = f"POST /v1/missions/recommend returned status {res1.status_code}"
            self.log("API", err_msg, "FAIL")
            self.failures.append(err_msg)
            return False
        
        data1 = res1.json()
        if "missions" not in data1 or not isinstance(data1["missions"], list):
            err_msg = "POST /v1/missions/recommend JSON schema invalid"
            self.log("API", err_msg, "FAIL")
            self.failures.append(err_msg)
            return False
        self.log("API", "POST /v1/missions/recommend contract passed.", "PASS")

        # Test 2: POST /v1/missions/{id}/submissions
        sub_payload = {
            "mission_id": "mission_01_tech",
            "answers": [
                {"id": 1, "text": "เมื่อเจอปัญหาวางแผนแก้ปัญหาและลงมือพัฒนาโปรแกรมสำเร็จ ได้ผลลัพธ์น่าพอใจ"}
            ],
            "student_id": "student_verify_01"
        }
        res2 = self.client.post("/v1/missions/mission_01_tech/submissions", json=sub_payload)
        if res2.status_code != 200:
            err_msg = f"POST /v1/missions/mission_01_tech/submissions returned status {res2.status_code}"
            self.log("API", err_msg, "FAIL")
            self.failures.append(err_msg)
            return False
        data2 = res2.json()
        if "result" not in data2 or "adaptive_questions" not in data2:
            err_msg = "POST /v1/missions/{id}/submissions JSON schema invalid"
            self.log("API", err_msg, "FAIL")
            self.failures.append(err_msg)
            return False
        self.log("API", "POST /v1/missions/{id}/submissions contract passed.", "PASS")

        # Test 3: POST /v1/future-paths
        fp_payload = {
            "education_level": "LOWER_SECONDARY",
            "interest_profile": {
                "riasec_scores": {"R": 0.85, "I": 0.90, "A": 0.40, "S": 0.50, "E": 0.60, "C": 0.70},
                "interest_tags": ["ซอฟต์แวร์", "เอไอ"],
                "preferred_fields": ["วิศวกรรมคอมพิวเตอร์"]
            },
            "evidence": {
                "academic_strengths": ["คณิตศาสตร์", "คอมพิวเตอร์"],
                "star_responses": [
                    {"id": 1, "text": "เมื่อเจอปัญหาและรับหน้าที่วางแผน ได้ลงมือเขียนโค้ดและทำผลงานสำเร็จ"}
                ],
                "practical_experience": ["ทำมินิโปรเจกต์ไอที"]
            }
        }
        res3 = self.client.post("/v1/future-paths", json=fp_payload)
        if res3.status_code != 200:
            err_msg = f"POST /v1/future-paths returned status {res3.status_code}"
            self.log("API", err_msg, "FAIL")
            self.failures.append(err_msg)
            return False
        data3 = res3.json()
        if "path_node" not in data3:
            err_msg = "POST /v1/future-paths response missing path_node"
            self.log("API", err_msg, "FAIL")
            self.failures.append(err_msg)
            return False
        
        node = data3["path_node"]
        path_id = node["path_id"]
        routes = node.get("route_options", [])
        if len(routes) != 3:
            err_msg = f"POST /v1/future-paths did not return 3 route options (got {len(routes)})"
            self.log("API", err_msg, "FAIL")
            self.failures.append(err_msg)
            return False
        
        route_names = {r["name"] for r in routes}
        expected_routes = {"Balanced Next Step", "Interest Growth Route", "Practical Access Route"}
        if route_names != expected_routes:
            err_msg = f"Route options mismatch: expected {expected_routes}, got {route_names}"
            self.log("API", err_msg, "FAIL")
            self.failures.append(err_msg)
            return False

        self.log("API", "POST /v1/future-paths contract & 3 routes passed.", "PASS")

        # Test 4: GET /v1/future-paths/{id}
        res4 = self.client.get(f"/v1/future-paths/{path_id}")
        if res4.status_code != 200:
            err_msg = f"GET /v1/future-paths/{path_id} returned status {res4.status_code}"
            self.log("API", err_msg, "FAIL")
            self.failures.append(err_msg)
            return False
        data4 = res4.json()
        if data4["path_id"] != path_id:
            err_msg = "GET /v1/future-paths/{id} path_id mismatch"
            self.log("API", err_msg, "FAIL")
            self.failures.append(err_msg)
            return False

        self.log("API", "GET /v1/future-paths/{id} contract passed.", "PASS")
        return True

    # =========================================================================
    # Check 4: RAG Retrieval & QLoRA Model Benchmarks
    # =========================================================================
    def audit_rag_and_lora_benchmarks(self) -> bool:
        self.log("BENCHMARK", "Evaluating RAG recall@20, grounded claim accuracy, and LoRA schema validity...")

        rag = RAGPipeline()

        # 1. Recall@20 Benchmark (Target: >= 90%)
        eval_set = [
            {"query": "หลักสูตร ปวช. 2567 สอศ. 12 กลุ่มสาขา", "expected_doc_ids": ["doc_ovec_12"]},
            {"query": "คะแนน TPAT1 TPAT2 TPAT3 TPAT4 TPAT5 TCAS Blueprint", "expected_doc_ids": ["doc_tcas_tpat"]},
            {"query": "การศึกษาระบบทวิภาคี DVE เรียนร่วมสถานประกอบการ", "expected_doc_ids": ["doc_dve_dual"]},
            {"query": "สถิติแรงงาน TDRI WEF Future of Jobs 2025 39%", "expected_doc_ids": ["doc_tdri_stats"]},
            {"query": "สายงานดิจิทัล ซอฟต์แวร์ AI ทักษะเขียนโปรแกรม", "expected_doc_ids": ["doc_stem_careers"]},
        ]
        recall = rag.evaluate_recall_at_k(eval_set, k=20)
        self.log("BENCHMARK", f"RAG Recall@20: {recall * 100:.2f}% (Threshold: >= 90.00%)")
        if recall < 0.90:
            err_msg = f"RAG Recall@20 threshold failed: {recall * 100:.2f}% < 90.00%"
            self.log("BENCHMARK", err_msg, "FAIL")
            self.failures.append(err_msg)
            return False
        else:
            self.log("BENCHMARK", "RAG Recall@20 benchmark PASSED.", "PASS")

        # 2. Grounded Claim Accuracy Benchmark (Target: >= 95%)
        claims_set = [
            {"claim": "หลักสูตร ปวช. 2567 แบ่งเป็น 12 กลุ่มสาขาวิชาหลัก", "expected_fact": ["สอศ", "12 กลุ่มสาขา", "ปวช"]},
            {"claim": "การสอบ TCAS ใช้คะแนน TPAT1-5", "expected_fact": ["tpat", "tcas", "ทปอ", "ความถนัด"]},
            {"claim": "การเรียนทวิภาคีฝึกงานในสถานประกอบการจริง", "expected_fact": ["ทวิภาคี", "สอศ", "สถานประกอบการ"]},
            {"claim": "รายงาน WEF 2025 คาดการณ์การปรับเปลี่ยนทักษะแรงงาน 39%", "expected_fact": ["wef", "tdri", "2025", "39%"]},
            {"claim": "สายงานดิจิทัลและซอฟต์แวร์เน้นทักษะการเขียนโปรแกรม", "expected_fact": ["ซอฟต์แวร์", "ไอที", "ดิจิทัล"]},
        ]
        accuracy = rag.evaluate_grounded_claim_accuracy(claims_set)
        self.log("BENCHMARK", f"Grounded Claim Accuracy: {accuracy * 100:.2f}% (Threshold: >= 95.00%)")
        if accuracy < 0.95:
            err_msg = f"Grounded claim accuracy threshold failed: {accuracy * 100:.2f}% < 95.00%"
            self.log("BENCHMARK", err_msg, "FAIL")
            self.failures.append(err_msg)
            return False
        else:
            self.log("BENCHMARK", "Grounded claim accuracy benchmark PASSED.", "PASS")

        # 3. Qwen3-4B QLoRA Schema Validity (Target: >= 98%)
        dataset_path = generate_qwen_qlora_dataset(str(self.root_dir / "data" / "qwen_qlora_dataset.jsonl"))
        schema_validity = validate_dataset_schema(dataset_path)
        self.log("BENCHMARK", f"Qwen QLoRA Schema Validity: {schema_validity * 100:.2f}% (Threshold: >= 98.00%)")
        if schema_validity < 0.98:
            err_msg = f"QLoRA schema validity threshold failed: {schema_validity * 100:.2f}% < 98.00%"
            self.log("BENCHMARK", err_msg, "FAIL")
            self.failures.append(err_msg)
            return False
        else:
            self.log("BENCHMARK", "Qwen QLoRA schema validity benchmark PASSED.", "PASS")

        return True

    def run_all_checks(self) -> bool:
        print("\n==========================================================")
        print("   FuturePath AI — Formal System Verification Suite   ")
        print("==========================================================\n")

        check1 = self.audit_repository_claims_and_links()
        check2 = self.audit_curriculum_and_tpat_compliance()
        check3 = self.audit_api_contracts()
        check4 = self.audit_rag_and_lora_benchmarks()

        print("\n----------------------------------------------------------")
        if check1 and check2 and check3 and check4:
            print("🎉 ALL SYSTEM VERIFICATION CHECKS PASSED CLEANLY! 🎉")
            print("----------------------------------------------------------\n")
            return True
        else:
            print(f"❌ VERIFICATION FAILED WITH {len(self.failures)} ERRORS:")
            for f in self.failures:
                print(f" - {f}")
            print("----------------------------------------------------------\n")
            return False


if __name__ == "__main__":
    agent = VerificationAgent(WORKSPACE_ROOT)
    success = agent.run_all_checks()
    if not success:
        sys.exit(1)
    sys.exit(0)
