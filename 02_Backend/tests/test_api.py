import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_api_recommend_missions():
    payload = {
        "education_level": "LOWER_SECONDARY",
        "interests": ["ดิจิทัล", "ซอฟต์แวร์"],
        "limit": 3
    }
    response = client.post("/v1/missions/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "missions" in data
    assert len(data["missions"]) <= 3


def test_api_submit_mission():
    payload = {
        "mission_id": "mission_01_tech",
        "answers": [
            {"id": 1, "text": "เมื่อเจอปัญหาวางแผนและสร้างระบบแก้ปัญหาได้สำเร็จ ผลลัพธ์ได้รับรางวัล"}
        ],
        "student_id": "student_test_01"
    }
    response = client.post("/v1/missions/mission_01_tech/submissions", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "result" in data
    assert data["result"]["score"] > 0.0


def test_api_create_and_get_future_path():
    payload = {
        "education_level": "LOWER_SECONDARY",
        "interest_profile": {
            "riasec_scores": {"R": 0.8, "I": 0.9, "A": 0.5, "S": 0.4, "E": 0.6, "C": 0.7},
            "interest_tags": ["ซอฟต์แวร์", "หุ่นยนต์"],
            "preferred_fields": ["วิศวกรรมคอมพิวเตอร์"]
        },
        "evidence": {
            "academic_strengths": ["คณิตศาสตร์", "ฟิสิกส์"],
            "star_responses": [
                {"id": 1, "text": "เมื่อเจอปัญหาหุ่นยนต์ขัดข้อง ได้วางแผนปรับแก้โค้ดและทดสอบใหม่สำเร็จ"}
            ],
            "practical_experience": ["เข้าชมรมคอมพิวเตอร์"]
        }
    }

    # 1. Create Future Path
    create_res = client.post("/v1/future-paths", json=payload)
    assert create_res.status_code == 200
    create_data = create_res.json()
    assert "path_node" in create_data
    node = create_data["path_node"]
    path_id = node["path_id"]
    assert len(node["route_options"]) == 3

    # 2. Get Future Path
    get_res = client.get(f"/v1/future-paths/{path_id}")
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert get_data["path_id"] == path_id
