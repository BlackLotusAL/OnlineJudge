from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from app.models.db import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(15), unique=True, index=True, comment="用户IP地址")
    first_access_time = Column(DateTime(timezone=True), server_default=func.now(), comment="首次访问时间")
    last_active_time = Column(DateTime(timezone=True), onupdate=func.now(), comment="最后活跃时间")
    total_questions = Column(Integer, default=0, comment="刷题总量")
    correct_questions = Column(Integer, default=0, comment="正确题目数")
    accuracy = Column(Float, default=0.0, comment="正确率")
    single_correct = Column(Integer, default=0, comment="单选题正确数")
    multiple_correct = Column(Integer, default=0, comment="多选题正确数")
    judge_correct = Column(Integer, default=0, comment="判断题正确数")
    single_total = Column(Integer, default=0, comment="单选题总数")
    multiple_total = Column(Integer, default=0, comment="多选题总数")
    judge_total = Column(Integer, default=0, comment="判断题总数")
    contributed_questions = Column(Integer, default=0, comment="贡献题目数")
    approved_questions = Column(Integer, default=0, comment="审核通过题目数")
