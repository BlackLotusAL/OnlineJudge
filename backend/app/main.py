from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import config
from app.models.db import engine, Base
from app.api import users, questions, exams, tickets, rankings, wrong_answers

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 初始化FastAPI应用
app = FastAPI(title="Online Judge API", description="在线刷题系统API", version="1.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含API路由
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(exams.router, prefix="/api/exams", tags=["exams"])
app.include_router(tickets.router, prefix="/api/tickets", tags=["tickets"])
app.include_router(rankings.router, prefix="/api/rankings", tags=["rankings"])
app.include_router(wrong_answers.router, prefix="/api/wrong-answers", tags=["wrong-answers"])

@app.get("/")
def root():
    return {"message": "Welcome to Online Judge System"}

@app.get("/api")
def api_root():
    return {
        "message": "Online Judge API",
        "version": "1.0.0",
        "endpoints": {
            "users": "/api/users",
            "questions": "/api/questions",
            "exams": "/api/exams",
            "tickets": "/api/tickets",
            "rankings": "/api/rankings",
            "wrong_answers": "/api/wrong-answers"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
