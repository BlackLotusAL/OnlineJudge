from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.models.db import get_db
from app.schemas import user as user_schemas
from app.models import user as user_models
from sqlalchemy import func

router = APIRouter()

# 获取客户端IP地址的辅助函数
def get_client_ip(request: Request):
    return request.client.host

@router.get("/me", response_model=user_schemas.User)
def get_current_user(request: Request, db: Session = Depends(get_db)):
    # 从请求中获取客户端IP地址
    ip_address = get_client_ip(request)
    
    # 查询数据库中的用户
    user = db.query(user_models.User).filter(user_models.User.ip_address == ip_address).first()
    
    # 如果用户不存在，则创建新用户
    if not user:
        user = user_models.User(ip_address=ip_address)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user

@router.get("/{user_id}", response_model=user_schemas.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    # 查询数据库中的用户
    user = db.query(user_models.User).filter(user_models.User.id == user_id).first()
    
    # 如果用户不存在，则返回404错误
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.put("/{user_id}", response_model=user_schemas.User)
def update_user(user_id: int, user_data: user_schemas.UserUpdate, db: Session = Depends(get_db)):
    # 查询数据库中的用户
    user = db.query(user_models.User).filter(user_models.User.id == user_id).first()
    
    # 如果用户不存在，则返回404错误
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 更新用户信息
    for field, value in user_data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user
