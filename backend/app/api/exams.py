from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.db import get_db
from app.schemas import exam as exam_schemas
from app.models import exam as exam_models, question as question_models
from datetime import datetime
from sqlalchemy import func

router = APIRouter()

@router.post("/generate", response_model=exam_schemas.Exam)
def generate_exam(exam_config: exam_schemas.ExamGenerate, db: Session = Depends(get_db)):
    # 创建新考试
    exam = exam_models.Exam(
        user_ip=exam_config.user_ip,
        duration=exam_config.duration,
        total_questions=exam_config.total_questions
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)
    
    # 根据题目类型生成题目数量分配
    # 10道多选题 + 10道单选题 + 10道判断题 = 30道题
    question_counts = {
        "多选题": 10,
        "单选题": 10,
        "判断题": 10
    }
    
    # 为每种题目类型随机选择题目
    for question_type, count in question_counts.items():
        # 查询已审核通过的题目
        questions = db.query(question_models.Question).filter(
            question_models.Question.type == question_type,
            question_models.Question.status == "已通过"
        ).order_by(func.random()).limit(count).all()
        
        # 将题目添加到考试中
        for q in questions:
            exam_question = exam_models.ExamQuestion(
                exam_id=exam.id,
                question_id=q.id
            )
            db.add(exam_question)
    
    db.commit()
    db.refresh(exam)
    
    return exam

@router.get("/{exam_id}", response_model=exam_schemas.Exam)
def get_exam(exam_id: int, db: Session = Depends(get_db)):
    # 查询数据库中的考试
    exam = db.query(exam_models.Exam).filter(exam_models.Exam.id == exam_id).first()
    
    # 如果考试不存在，则返回404错误
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    return exam

@router.post("/{exam_id}/submit", response_model=exam_schemas.Exam)
def submit_exam(exam_id: int, answers: exam_schemas.ExamSubmit, db: Session = Depends(get_db)):
    # 查询数据库中的考试
    exam = db.query(exam_models.Exam).filter(exam_models.Exam.id == exam_id).first()
    
    # 如果考试不存在，则返回404错误
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # 如果考试已经结束，则返回错误
    if exam.status == "已完成":
        raise HTTPException(status_code=400, detail="Exam already completed")
    
    # 更新考试状态和结束时间
    exam.status = "已完成"
    exam.end_time = datetime.now()
    
    # 计算得分和正确率
    total_score = 0.0
    obtained_score = 0.0
    correct_count = 0
    
    # 处理每个答案
    for answer in answers.answers:
        # 查询考试题目
        exam_question = db.query(exam_models.ExamQuestion).filter(
            exam_models.ExamQuestion.exam_id == exam_id,
            exam_models.ExamQuestion.question_id == answer.question_id
        ).first()
        
        if exam_question:
            # 查询题目信息
            question = db.query(question_models.Question).filter(
                question_models.Question.id == answer.question_id
            ).first()
            
            if question:
                # 更新用户答案
                exam_question.user_answer = answer.user_answer
                
                # 判断答案是否正确
                is_correct = exam_question.user_answer == question.correct_answer
                exam_question.is_correct = is_correct
                
                # 计算本题得分（每道题分值相同）
                question_score = exam.total_score / exam.total_questions
                exam_question.score = question_score if is_correct else 0.0
                
                # 更新总分和得分
                total_score += question_score
                obtained_score += exam_question.score
                
                # 更新正确题数
                if is_correct:
                    correct_count += 1
    
    # 更新考试信息
    exam.total_score = total_score
    exam.obtained_score = obtained_score
    exam.correct_questions = correct_count
    exam.accuracy = (correct_count / exam.total_questions) * 100 if exam.total_questions > 0 else 0.0
    
    db.commit()
    db.refresh(exam)
    
    return exam

@router.get("/history/{user_ip}", response_model=list[exam_schemas.Exam])
def get_exam_history(user_ip: str, db: Session = Depends(get_db), skip: int = 0, limit: int = 10):
    # 查询数据库中的考试历史
    exams = db.query(exam_models.Exam).filter(
        exam_models.Exam.user_ip == user_ip
    ).order_by(exam_models.Exam.start_time.desc()).offset(skip).limit(limit).all()
    
    return exams
