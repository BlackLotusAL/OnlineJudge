#!/usr/bin/env python3
"""
数据库迁移脚本：添加题目科目细分字段
"""

from sqlalchemy import create_engine, text
from app.models.db import DATABASE_URL

def migrate():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE questions ADD COLUMN language VARCHAR(20) COMMENT '编程语言'"))
            print("✓ 添加language字段成功")
        except Exception as e:
            print(f"language字段可能已存在: {e}")
        
        try:
            conn.execute(text("ALTER TABLE questions ADD COLUMN difficulty_level VARCHAR(20) COMMENT '难度等级'"))
            print("✓ 添加difficulty_level字段成功")
        except Exception as e:
            print(f"difficulty_level字段可能已存在: {e}")
        
        try:
            conn.execute(text("ALTER TABLE questions ADD COLUMN subject_category VARCHAR(20) COMMENT '科目分类'"))
            print("✓ 添加subject_category字段成功")
        except Exception as e:
            print(f"subject_category字段可能已存在: {e}")
        
        conn.commit()
        print("✓ 数据库迁移完成")

if __name__ == "__main__":
    migrate()