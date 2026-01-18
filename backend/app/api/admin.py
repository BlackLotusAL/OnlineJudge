from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.models.db import get_db
from config import Config
from pydantic import BaseModel

router = APIRouter()
config = Config()

class AdminConfigUpdate(BaseModel):
    enable_ip_whitelist: bool = False
    allowed_ips: list[str] = []

def check_admin_access(request: Request):
    """检查IP是否允许访问后台管理"""
    client_ip = request.client.host
    
    if not config.is_ip_allowed_for_admin(client_ip):
        raise HTTPException(
            status_code=403,
            detail=f"您的IP地址({client_ip})不在允许列表中，无法访问后台管理"
        )
    
    return client_ip

@router.get("/check-access")
def check_admin_ip_access(request: Request):
    """检查当前IP是否允许访问后台管理"""
    client_ip = request.client.host
    is_allowed = config.is_ip_allowed_for_admin(client_ip)
    allowed_ips = config.get_admin_allowed_ips()
    
    return {
        "ip": client_ip,
        "allowed": is_allowed,
        "allowed_ips": allowed_ips,
        "whitelist_enabled": config.config.get('admin', {}).get('enable_ip_whitelist', False)
    }

@router.get("/config")
def get_admin_config():
    """获取后台管理配置"""
    admin_config = config.config.get('admin', {})
    
    return {
        "enable_ip_whitelist": admin_config.get('enable_ip_whitelist', False),
        "allowed_ips": admin_config.get('allowed_ips', [])
    }

@router.put("/config")
def update_admin_config(config_update: AdminConfigUpdate):
    """更新后台管理配置"""
    import yaml
    import os
    
    config_path = os.path.join(os.path.dirname(__file__), '../../config/config.yaml')
    
    # 读取当前配置
    with open(config_path, 'r', encoding='utf-8') as f:
        current_config = yaml.safe_load(f)
    
    # 更新admin配置
    if 'admin' not in current_config:
        current_config['admin'] = {}
    
    current_config['admin']['enable_ip_whitelist'] = config_update.enable_ip_whitelist
    current_config['admin']['allowed_ips'] = config_update.allowed_ips
    
    # 写入配置文件
    with open(config_path, 'w', encoding='utf-8') as f:
        yaml.dump(current_config, f, allow_unicode=True)
    
    # 重新加载配置
    from config import Config
    global config
    config = Config()
    
    return {
        "message": "配置更新成功",
        "config": {
            "enable_ip_whitelist": config_update.enable_ip_whitelist,
            "allowed_ips": config_update.allowed_ips
        }
    }