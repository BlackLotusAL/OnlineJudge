from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.models.db import get_db
from app.schemas import wrong_answer as wrong_answer_schemas
from app.models import wrong_answer as wrong_answer_models
from app.models import question as question_models
from datetime import datetime

router = APIRouter()

# 获取客户端IP地址的辅助函数
def get_client_ip(request: Request):
    return request.client.host

@router.get("/")
def get_wrong_answers(db: Session = Depends(get_db), skip: int = 0, limit: int = 100, type: str = None, subject: str = None, is_reviewed: bool = None):
    query = db.query(wrong_answer_models.WrongAnswer)
    
    if type:
        query = query.filter(wrong_answer_models.WrongAnswer.question_type == type)
    if subject:
        query = query.filter(wrong_answer_models.WrongAnswer.question_subject == subject)
    if is_reviewed is not None:
        query = query.filter(wrong_answer_models.WrongAnswer.is_reviewed == is_reviewed)
    
    wrong_answers = query.offset(skip).limit(limit).all()
    return wrong_answers

@router.post("/")
def create_wrong_answer(wrong_answer: wrong_answer_schemas.WrongAnswerCreate, db: Session = Depends(get_db)):
    db_wrong_answer = wrong_answer_models.WrongAnswer(**wrong_answer.model_dump())
    db.add(db_wrong_answer)
    db.commit()
    db.refresh(db_wrong_answer)
    return db_wrong_answer

@router.put("/{wrong_answer_id}")
def update_wrong_answer(wrong_answer_id: int, wrong_answer: wrong_answer_schemas.WrongAnswerUpdate, db: Session = Depends(get_db)):
    db_wrong_answer = db.query(wrong_answer_models.WrongAnswer).filter(wrong_answer_models.WrongAnswer.id == wrong_answer_id).first()
    
    if not db_wrong_answer:
        raise HTTPException(status_code=404, detail="Wrong answer not found")
    
    for field, value in wrong_answer.model_dump(exclude_unset=True).items():
        setattr(db_wrong_answer, field, value)
    
    db.commit()
    db.refresh(db_wrong_answer)
    return db_wrong_answer

@router.delete("/{wrong_answer_id}")
def delete_wrong_answer(wrong_answer_id: int, db: Session = Depends(get_db)):
    db_wrong_answer = db.query(wrong_answer_models.WrongAnswer).filter(wrong_answer_models.WrongAnswer.id == wrong_answer_id).first()
    
    if not db_wrong_answer:
        raise HTTPException(status_code=404, detail="Wrong answer not found")
    
    db.delete(db_wrong_answer)
    db.commit()
    
    return {"message": f"Wrong answer {wrong_answer_id} deleted successfully"}