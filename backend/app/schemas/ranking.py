from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class RankingBase(BaseModel):
    user_ip: str = Field(..., max_length=15, description="用户IP")
    total_questions: int = Field(default=0, description="刷题总量")
    correct_questions: int = Field(default=0, description="正确题目数")
    accuracy: float = Field(default=0.0, description="正确率")
    contributed_questions: int = Field(default=0, description="贡献题目数")
    approved_questions: int = Field(default=0, description="审核通过题目数")
    ranking_score: float = Field(default=0.0, description="排名分数")


class RankingCreate(RankingBase):
    pass


class RankingUpdate(BaseModel):
    total_questions: Optional[int] = Field(None, description="刷题总量")
    correct_questions: Optional[int] = Field(None, description="正确题目数")
    accuracy: Optional[float] = Field(None, description="正确率")
    contributed_questions: Optional[int] = Field(None, description="贡献题目数")
    approved_questions: Optional[int] = Field(None, description="审核通过题目数")
    ranking_score: Optional[float] = Field(None, description="排名分数")


class RankingInDB(RankingBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True


class Ranking(RankingInDB):
    pass