from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.db import get_db
from app.schemas import ranking as ranking_schemas
from app.models import ranking as ranking_models
from app.models import user as user_models
from sqlalchemy import func

router = APIRouter()

@router.get("/刷题总量")
def get_rankings_by_total(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    users = db.query(user_models.User).order_by(
        user_models.User.total_questions.desc()
    ).offset(skip).limit(limit).all()
    
    rankings = []
    for i, user in enumerate(users, start=skip + 1):
        rankings.append({
            'rank': i,
            'userId': user.id,
            'userIp': user.ip_address,
            'totalQuestions': user.total_questions,
            'correctQuestions': user.correct_questions,
            'accuracy': user.accuracy
        })
    
    return rankings

@router.get("/正确率")
def get_rankings_by_accuracy(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    users = db.query(user_models.User).order_by(
        user_models.User.accuracy.desc()
    ).offset(skip).limit(limit).all()
    
    rankings = []
    for i, user in enumerate(users, start=skip + 1):
        rankings.append({
            'rank': i,
            'userId': user.id,
            'userIp': user.ip_address,
            'accuracy': user.accuracy,
            'correctQuestions': user.correct_questions,
            'totalQuestions': user.total_questions
        })
    
    return rankings

@router.get("/贡献榜")
def get_rankings_by_contribution(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    users = db.query(user_models.User).order_by(
        user_models.User.contributed_questions.desc()
    ).offset(skip).limit(limit).all()
    
    rankings = []
    for i, user in enumerate(users, start=skip + 1):
        rankings.append({
            'rank': i,
            'userId': user.id,
            'userIp': user.ip_address,
            'contributedQuestions': user.contributed_questions,
            'approvedQuestions': user.approved_questions,
            'rankingScore': user.contributed_questions * 10 + user.approved_questions * 5
        })
    
    return rankings
