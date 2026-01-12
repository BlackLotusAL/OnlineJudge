from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.db import Base
import enum

# 考试状态枚举
class ExamStatus(str, enum.Enum):
    ongoing = "进行中"
    completed = "已完成"
    expired = "已过期"

class Exam(Base):
    __tablename__ = "exams"
    
    id = Column(Integer, primary_key=True, index=True)
    user_ip = Column(String(15), nullable=False, comment="用户IP")
    start_time = Column(DateTime(timezone=True), server_default=func.now(), comment="开始时间")
    end_time = Column(DateTime(timezone=True), nullable=True, comment="结束时间")
    status = Column(Enum(ExamStatus), default=ExamStatus.ongoing, comment="考试状态")
    total_score = Column(Float, default=0.0, comment="总分")
    obtained_score = Column(Float, default=0.0, comment="得分")
    duration = Column(Integer, default=3600, comment="考试时长，单位秒")
    total_questions = Column(Integer, default=30, comment="总题数")
    correct_questions = Column(Integer, default=0, comment="正确题数")
    accuracy = Column(Float, default=0.0, comment="正确率")
    
    # 关系
    exam_questions = relationship("ExamQuestion", back_populates="exam")

class ExamQuestion(Base):
    __tablename__ = "exam_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False, comment="考试ID")
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, comment="题目ID")
    user_answer = Column(String(10), nullable=True, comment="用户答案")
    is_correct = Column(Boolean, default=False, comment="是否正确")
    score = Column(Float, default=0.0, comment="本题得分")
    
    # 关系
    exam = relationship("Exam", back_populates="exam_questions")
    question = relationship("Question", back_populates="exams")
