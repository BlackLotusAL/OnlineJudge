from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class WrongAnswerBase(BaseModel):
    user_ip: str = Field(..., max_length=15, description="用户IP")
    question_id: int = Field(..., description="题目ID")
    user_answer: str = Field(..., max_length=10, description="用户答案")

class WrongAnswerCreate(WrongAnswerBase):
    pass

class WrongAnswerUpdate(BaseModel):
    is_reviewed: bool = Field(default=False, description="是否已复习")
    review_time: Optional[datetime] = Field(None, description="复习时间")

class WrongAnswerInDB(WrongAnswerBase):
    id: int
    wrong_time: datetime
    is_reviewed: bool = False
    review_time: Optional[datetime]
    
    class Config:
        from_attributes = True

class WrongAnswer(WrongAnswerInDB):
    pass
