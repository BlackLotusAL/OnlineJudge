from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.db import Base
import enum

# 题目类型枚举
class QuestionType(str, enum.Enum):
    single = "单选题"
    multiple = "多选题"
    judge = "判断题"

# 题目状态枚举
class QuestionStatus(str, enum.Enum):
    pending = "待审核"
    approved = "已通过"
    rejected = "已拒绝"
    draft = "草稿"

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(QuestionType), nullable=False, comment="题目类型")
    status = Column(Enum(QuestionStatus), default=QuestionStatus.pending, comment="题目状态")
    content = Column(Text, nullable=False, comment="题干")
    options = Column(Text, nullable=False, comment="选项，JSON格式")
    correct_answer = Column(String(10), nullable=False, comment="正确答案")
    explanation = Column(Text, nullable=True, comment="解题思路")
    difficulty = Column(Float, default=1.0, comment="难度等级，1-5")
    subject = Column(String(50), nullable=False, comment="所属科目")
    tags = Column(String(255), nullable=True, comment="标签，逗号分隔")
    image = Column(Text, nullable=True, comment="图片，base64编码或文件路径")
    creator_ip = Column(String(15), nullable=True, comment="创建者IP")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")
    approved_at = Column(DateTime(timezone=True), nullable=True, comment="审核通过时间")
    approved_by = Column(String(15), nullable=True, comment="审核者IP")
    
    # 关系
    exams = relationship("ExamQuestion", back_populates="question")
    wrong_answers = relationship("WrongAnswer", back_populates="question")
    tickets = relationship("Ticket", back_populates="question")
