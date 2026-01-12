from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from app.models.db import Base

class Ranking(Base):
    __tablename__ = "rankings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_ip = Column(String(15), unique=True, index=True, comment="用户IP")
    total_questions = Column(Integer, default=0, comment="刷题总量")
    correct_questions = Column(Integer, default=0, comment="正确题目数")
    accuracy = Column(Float, default=0.0, comment="正确率")
    contributed_questions = Column(Integer, default=0, comment="贡献题目数")
    approved_questions = Column(Integer, default=0, comment="审核通过题目数")
    ranking_score = Column(Float, default=0.0, comment="排名分数")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")
