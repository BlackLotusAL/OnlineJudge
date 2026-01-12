from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.models.exam import ExamStatus

class ExamQuestionBase(BaseModel):
    question_id: int = Field(..., description="题目ID")
    user_answer: Optional[str] = Field(None, max_length=10, description="用户答案")

class ExamGenerate(BaseModel):
    user_ip: str = Field(..., max_length=15, description="用户IP")
    duration: int = Field(default=3600, description="考试时长，单位秒")
    total_questions: int = Field(default=30, description="总题数")

class ExamSubmit(BaseModel):
    answers: List[ExamQuestionBase] = Field(..., description="答案列表")

class ExamQuestionInDB(ExamQuestionBase):
    id: int
    exam_id: int
    is_correct: bool = False
    score: float = 0.0
    
    class Config:
        from_attributes = True

class ExamQuestion(ExamQuestionInDB):
    pass

class ExamBase(BaseModel):
    user_ip: str = Field(..., max_length=15, description="用户IP")
    duration: int = Field(default=3600, description="考试时长，单位秒")
    total_questions: int = Field(default=30, description="总题数")

class ExamCreate(ExamBase):
    pass

class ExamInDB(ExamBase):
    id: int
    start_time: datetime
    end_time: Optional[datetime]
    status: ExamStatus
    total_score: float = 0.0
    obtained_score: float = 0.0
    correct_questions: int = 0
    accuracy: float = 0.0
    
    class Config:
        from_attributes = True

class Exam(ExamInDB):
    exam_questions: Optional[List[ExamQuestion]] = None
