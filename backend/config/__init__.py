import yaml
import os
from pathlib import Path
from typing import List, Optional

class Config:
    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = os.path.join(os.path.dirname(__file__), 'config.yaml')
        
        with open(config_path, 'r', encoding='utf-8') as f:
            self.config = yaml.safe_load(f)
    
    def get(self, key: str, default=None):
        keys = key.split('.')
        value = self.config
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        return value
    
    def get_admin_allowed_ips(self) -> List[str]:
        """获取允许访问后台管理的IP列表"""
        admin_config = self.config.get('admin', {})
        if not admin_config:
            return []
        
        if not admin_config.get('enable_ip_whitelist', False):
            return []  # 如果未启用白名单，返回空列表（允许所有IP）
        
        return admin_config.get('allowed_ips', [])
    
    def is_ip_allowed_for_admin(self, ip: str) -> bool:
        """检查IP是否允许访问后台管理"""
        if not self.config.get('admin', {}).get('enable_ip_whitelist', False):
            return True  # 如果未启用白名单，允许所有IP
        
        allowed_ips = self.get_admin_allowed_ips()
        return ip in allowed_ips

config = Config()
