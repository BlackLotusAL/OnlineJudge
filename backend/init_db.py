#!/usr/bin/env python3
"""数据库初始化脚本"""

from app.models.db import engine, Base
from app.models import *

print("正在创建数据库表...")
Base.metadata.create_all(bind=engine)
print("数据库表创建成功！")