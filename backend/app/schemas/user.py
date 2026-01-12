from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    ip_address: str = Field(..., max_length=15, description="用户IP地址")

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    # 用户可以更新的字段
    pass

class UserInDB(UserBase):
    id: int
    first_access_time: datetime
    last_active_time: Optional[datetime]
    total_questions: int = 0
    correct_questions: int = 0
    accuracy: float = 0.0
    single_correct: int = 0
    multiple_correct: int = 0
    judge_correct: int = 0
    single_total: int = 0
    multiple_total: int = 0
    judge_total: int = 0
    
    class Config:
        from_attributes = True

class User(UserInDB):
    pass
