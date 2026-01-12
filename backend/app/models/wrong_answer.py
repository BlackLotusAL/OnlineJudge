from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.db import Base

class WrongAnswer(Base):
    __tablename__ = "wrong_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_ip = Column(String(15), nullable=False, comment="用户IP")
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, comment="题目ID")
    user_answer = Column(String(10), nullable=False, comment="用户答案")
    wrong_time = Column(DateTime(timezone=True), server_default=func.now(), comment="答错时间")
    is_reviewed = Column(Boolean, default=False, comment="是否已复习")
    review_time = Column(DateTime(timezone=True), nullable=True, comment="复习时间")
    
    # 关系
    question = relationship("Question", back_populates="wrong_answers")
