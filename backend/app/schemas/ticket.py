from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.ticket import TicketStatus

class TicketBase(BaseModel):
    user_ip: str = Field(..., max_length=15, description="提交者IP")
    question_id: int = Field(..., description="题目ID")
    title: str = Field(..., max_length=100, description="工单标题")
    content: str = Field(..., description="工单内容")

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = Field(None, description="工单状态")
    resolution: Optional[str] = Field(None, description="解决方案")
    resolver_ip: Optional[str] = Field(None, max_length=15, description="处理者IP")

class TicketInDB(TicketBase):
    id: int
    status: TicketStatus
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    resolver_ip: Optional[str]
    resolution: Optional[str]
    
    class Config:
        from_attributes = True

class Ticket(TicketInDB):
    pass
