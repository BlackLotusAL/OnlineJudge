import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.db import Base, get_db
from app.main import app

# 创建测试数据库引擎
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 创建测试数据库会话
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建测试数据库表
Base.metadata.create_all(bind=engine)

# 依赖项，用于获取测试数据库会话
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# 替换应用中的依赖项
app.dependency_overrides[get_db] = override_get_db

# 创建测试客户端
client = TestClient(app)

@pytest.fixture(scope="module")
def test_db():
    # 创建测试数据库表
    Base.metadata.create_all(bind=engine)
    yield
    # 销毁测试数据库表
    Base.metadata.drop_all(bind=engine)
