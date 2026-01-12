from fastapi.testclient import TestClient
from app.main import app
from app.models.db import get_db
from app.models.user import User

client = TestClient(app)

def test_get_current_user(test_db):
    """测试获取当前用户"""
    response = client.get("/api/users/me")
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "ip_address" in data
    assert "first_access_time" in data

def test_get_user(test_db):
    """测试获取指定用户"""
    # 首先创建一个用户
    response = client.get("/api/users/me")
    user_id = response.json()["id"]
    
    # 然后获取该用户
    response = client.get(f"/api/users/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id

def test_update_user(test_db):
    """测试更新用户信息"""
    # 首先创建一个用户
    response = client.get("/api/users/me")
    user_id = response.json()["id"]
    
    # 然后更新该用户
    response = client.put(f"/api/users/{user_id}", json={})
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id

def test_get_nonexistent_user(test_db):
    """测试获取不存在的用户"""
    response = client.get("/api/users/9999")
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"
