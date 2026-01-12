from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_questions(test_db):
    """测试获取题目列表"""
    response = client.get("/api/questions/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_question(test_db):
    """测试获取指定题目"""
    # 首先创建一个题目
    question_data = {
        "type": "单选题",
        "content": "测试题目",
        "options": '["选项A", "选项B", "选项C", "选项D"]',
        "correct_answer": "A",
        "explanation": "测试解析",
        "difficulty": 1.0,
        "subject": "测试科目",
        "tags": "测试,标签",
        "image": "",
        "creator_ip": "127.0.0.1"
    }
    response = client.post("/api/questions/", json=question_data)
    question_id = response.json()["id"]
    
    # 然后获取该题目
    response = client.get(f"/api/questions/{question_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == question_id
    assert data["content"] == "测试题目"

def test_create_question(test_db):
    """测试创建题目"""
    question_data = {
        "type": "单选题",
        "content": "测试题目",
        "options": '["选项A", "选项B", "选项C", "选项D"]',
        "correct_answer": "A",
        "explanation": "测试解析",
        "difficulty": 1.0,
        "subject": "测试科目",
        "tags": "测试,标签",
        "image": "",
        "creator_ip": "127.0.0.1"
    }
    response = client.post("/api/questions/", json=question_data)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["content"] == "测试题目"
    assert data["correct_answer"] == "A"

def test_update_question(test_db):
    """测试更新题目"""
    # 首先创建一个题目
    question_data = {
        "type": "单选题",
        "content": "测试题目",
        "options": '["选项A", "选项B", "选项C", "选项D"]',
        "correct_answer": "A",
        "explanation": "测试解析",
        "difficulty": 1.0,
        "subject": "测试科目",
        "tags": "测试,标签",
        "image": "",
        "creator_ip": "127.0.0.1"
    }
    response = client.post("/api/questions/", json=question_data)
    question_id = response.json()["id"]
    
    # 然后更新该题目
    update_data = {
        "content": "更新后的测试题目",
        "correct_answer": "B"
    }
    response = client.put(f"/api/questions/{question_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == question_id
    assert data["content"] == "更新后的测试题目"
    assert data["correct_answer"] == "B"

def test_delete_question(test_db):
    """测试删除题目"""
    # 首先创建一个题目
    question_data = {
        "type": "单选题",
        "content": "测试题目",
        "options": '["选项A", "选项B", "选项C", "选项D"]',
        "correct_answer": "A",
        "explanation": "测试解析",
        "difficulty": 1.0,
        "subject": "测试科目",
        "tags": "测试,标签",
        "image": "",
        "creator_ip": "127.0.0.1"
    }
    response = client.post("/api/questions/", json=question_data)
    question_id = response.json()["id"]
    
    # 然后删除该题目
    response = client.delete(f"/api/questions/{question_id}")
    assert response.status_code == 200
    assert response.json()["message"] == f"Question {question_id} deleted successfully"
    
    # 验证题目已被删除
    response = client.get(f"/api/questions/{question_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Question not found"

def test_get_nonexistent_question(test_db):
    """测试获取不存在的题目"""
    response = client.get("/api/questions/9999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Question not found"
