from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict
from app.models.question import QuestionType, QuestionStatus, Language, DifficultyLevel, SubjectCategory

class QuestionBase(BaseModel):
    type: QuestionType = Field(..., description="题目类型")
    content: str = Field(..., description="题干")
    options: str = Field(..., description="选项，JSON格式")
    correct_answer: str = Field(..., max_length=10, description="正确答案")
    explanation: Optional[str] = Field(None, description="解题思路")
    difficulty: float = Field(default=1.0, ge=1.0, le=5.0, description="难度等级，1-5")
    language: Optional[Language] = Field(None, description="编程语言")
    difficulty_level: Optional[DifficultyLevel] = Field(None, description="难度等级")
    subject_category: Optional[SubjectCategory] = Field(None, description="科目分类")
    tags: Optional[str] = Field(None, max_length=255, description="标签，逗号分隔")
    image: Optional[str] = Field(None, description="图片，base64编码或文件路径")

class QuestionCreate(QuestionBase):
    creator_ip: str = Field(..., max_length=15, description="创建者IP")

class QuestionUpdate(BaseModel):
    content: Optional[str] = Field(None, description="题干")
    options: Optional[str] = Field(None, description="选项，JSON格式")
    correct_answer: Optional[str] = Field(None, max_length=10, description="正确答案")
    explanation: Optional[str] = Field(None, description="解题思路")
    difficulty: Optional[float] = Field(None, ge=1.0, le=5.0, description="难度等级，1-5")
    language: Optional[Language] = Field(None, description="编程语言")
    difficulty_level: Optional[DifficultyLevel] = Field(None, description="难度等级")
    subject_category: Optional[SubjectCategory] = Field(None, description="科目分类")
    tags: Optional[str] = Field(None, max_length=255, description="标签，逗号分隔")
    image: Optional[str] = Field(None, description="图片，base64编码或文件路径")
    status: Optional[QuestionStatus] = Field(None, description="题目状态")

class QuestionInDB(QuestionBase):
    id: int
    status: QuestionStatus
    creator_ip: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    approved_at: Optional[datetime]
    approved_by: Optional[str]
    
    class Config:
        from_attributes = True

class Question(QuestionInDB):
    pass
