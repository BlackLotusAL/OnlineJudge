from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.models.db import get_db
from app.schemas import question as question_schemas
from app.models import question as question_models
from sqlalchemy import func

router = APIRouter()

@router.get("/", response_model=list[question_schemas.Question])
def get_questions(
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 100,
    type: str = None,
    status: str = None,
    subject: str = None,
    tag: str = None,
    difficulty_min: float = None,
    difficulty_max: float = None
):
    # 构建查询
    query = db.query(question_models.Question)
    
    # 应用筛选条件
    if type:
        query = query.filter(question_models.Question.type == type)
    if status:
        query = query.filter(question_models.Question.status == status)
    if subject:
        query = query.filter(question_models.Question.subject == subject)
    if tag:
        query = query.filter(question_models.Question.tags.contains(tag))
    if difficulty_min:
        query = query.filter(question_models.Question.difficulty >= difficulty_min)
    if difficulty_max:
        query = query.filter(question_models.Question.difficulty <= difficulty_max)
    
    # 执行查询
    questions = query.offset(skip).limit(limit).all()
    
    return questions

@router.get("/{question_id}", response_model=question_schemas.Question)
def get_question(question_id: int, db: Session = Depends(get_db)):
    # 查询数据库中的题目
    question = db.query(question_models.Question).filter(question_models.Question.id == question_id).first()
    
    # 如果题目不存在，则返回404错误
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return question

@router.post("/", response_model=question_schemas.Question)
def create_question(
    request: Request,
    question: question_schemas.QuestionCreate, 
    db: Session = Depends(get_db)
):
    # 创建新题目
    db_question = question_models.Question(**question.model_dump())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    return db_question

@router.put("/{question_id}", response_model=question_schemas.Question)
def update_question(
    question_id: int, 
    question: question_schemas.QuestionUpdate, 
    db: Session = Depends(get_db)
):
    # 查询数据库中的题目
    db_question = db.query(question_models.Question).filter(question_models.Question.id == question_id).first()
    
    # 如果题目不存在，则返回404错误
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # 更新题目信息
    for field, value in question.model_dump(exclude_unset=True).items():
        setattr(db_question, field, value)
    
    db.commit()
    db.refresh(db_question)
    
    return db_question

@router.delete("/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    # 查询数据库中的题目
    db_question = db.query(question_models.Question).filter(question_models.Question.id == question_id).first()
    
    # 如果题目不存在，则返回404错误
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # 删除题目
    db.delete(db_question)
    db.commit()
    
    return {"message": f"Question {question_id} deleted successfully"}
