#!/usr/bin/env python3
"""
数据库迁移脚本：添加用户贡献题目相关字段
"""

from sqlalchemy import create_engine, text
from app.models.db import DATABASE_URL

def migrate():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN contributed_questions INTEGER DEFAULT 0"))
            print("✓ 添加contributed_questions字段成功")
        except Exception as e:
            print(f"contributed_questions字段可能已存在: {e}")
        
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN approved_questions INTEGER DEFAULT 0"))
            print("✓ 添加approved_questions字段成功")
        except Exception as e:
            print(f"approved_questions字段可能已存在: {e}")
        
        conn.commit()
        print("✓ 数据库迁移完成")

if __name__ == "__main__":
    migrate()