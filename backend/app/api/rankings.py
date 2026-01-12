from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.db import get_db
from app.schemas import ranking as ranking_schemas
from app.models import ranking as ranking_models

router = APIRouter()

@router.get("/刷题总量")
def get_rankings_by_total(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return {"message": f"Get rankings by total questions, skip: {skip}, limit: {limit}"}

@router.get("/正确率")
def get_rankings_by_accuracy(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return {"message": f"Get rankings by accuracy, skip: {skip}, limit: {limit}"}

@router.get("/贡献榜")
def get_rankings_by_contribution(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return {"message": f"Get rankings by contribution, skip: {skip}, limit: {limit}"}
