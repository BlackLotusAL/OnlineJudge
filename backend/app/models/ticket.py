from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.db import Base
import enum

# 工单状态枚举
class TicketStatus(str, enum.Enum):
    pending = "待处理"
    processing = "处理中"
    resolved = "已解决"
    closed = "已关闭"

class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_ip = Column(String(15), nullable=False, comment="提交者IP")
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, comment="题目ID")
    title = Column(String(100), nullable=False, comment="工单标题")
    content = Column(Text, nullable=False, comment="工单内容")
    status = Column(Enum(TicketStatus), default=TicketStatus.pending, comment="工单状态")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")
    resolved_at = Column(DateTime(timezone=True), nullable=True, comment="解决时间")
    resolver_ip = Column(String(15), nullable=True, comment="处理者IP")
    resolution = Column(Text, nullable=True, comment="解决方案")
    
    # 关系
    question = relationship("Question", back_populates="tickets")
