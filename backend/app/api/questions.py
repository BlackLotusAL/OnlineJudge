from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from app.models.db import get_db
from app.schemas import question as question_schemas
from app.models import question as question_models
from sqlalchemy import func
import json
import pandas as pd
import io
from datetime import datetime

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

@router.get("/export")
def export_questions(
    db: Session = Depends(get_db),
    type: str = None,
    status: str = None,
    language: str = None,
    difficulty_level: str = None,
    subject_category: str = None,
    format: str = "json"
):
    """导出题库为JSON或Excel文件"""
    # 构建查询
    query = db.query(question_models.Question)
    
    # 应用筛选条件
    if type:
        query = query.filter(question_models.Question.type == type)
    if status:
        query = query.filter(question_models.Question.status == status)
    if language:
        query = query.filter(question_models.Question.language == language)
    if difficulty_level:
        query = query.filter(question_models.Question.difficulty_level == difficulty_level)
    if subject_category:
        query = query.filter(question_models.Question.subject_category == subject_category)
    
    # 执行查询
    questions = query.all()
    
    # 转换为字典列表
    questions_data = []
    for q in questions:
        question_dict = {
            "id": q.id,
            "type": q.type.value if q.type else None,
            "status": q.status.value if q.status else None,
            "content": q.content,
            "options": json.loads(q.options) if q.options else [],
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
            "difficulty": q.difficulty,
            "language": q.language.value if q.language else None,
            "difficulty_level": q.difficulty_level.value if q.difficulty_level else None,
            "subject_category": q.subject_category.value if q.subject_category else None,
            "tags": q.tags,
            "image": q.image,
            "creator_ip": q.creator_ip,
            "created_at": q.created_at.isoformat() if q.created_at else None,
            "updated_at": q.updated_at.isoformat() if q.updated_at else None
        }
        questions_data.append(question_dict)
    
    # 根据格式导出
    if format == "json":
        # 导出为JSON
        json_data = json.dumps(questions_data, ensure_ascii=False, indent=2)
        json_bytes = io.BytesIO(json_data.encode('utf-8'))
        json_bytes.seek(0)
        
        return FileResponse(
            json_bytes,
            media_type="application/json",
            filename=f"questions_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
    elif format == "excel":
        # 导出为Excel
        df = pd.DataFrame(questions_data)
        excel_buffer = io.BytesIO()
        with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='题库')
        excel_buffer.seek(0)
        
        return FileResponse(
            excel_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename=f"questions_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        )
    else:
        raise HTTPException(status_code=400, detail="不支持的导出格式")

@router.post("/import")
def import_questions(
    file,
    db: Session = Depends(get_db)
):
    """从JSON或Excel文件导入题库"""
    # 判断文件类型
    if file.filename.endswith('.json'):
        # 从JSON导入
        try:
            content = file.file.read().decode('utf-8')
            questions_data = json.loads(content)
            
            imported_count = 0
            failed_count = 0
            errors = []
            
            for q_data in questions_data:
                try:
                    # 创建新题目
                    new_question = question_models.Question(
                        type=q_data.get('type'),
                        content=q_data.get('content'),
                        options=json.dumps(q_data.get('options', [])),
                        correct_answer=q_data.get('correct_answer'),
                        explanation=q_data.get('explanation'),
                        difficulty=q_data.get('difficulty', 1.0),
                        language=q_data.get('language'),
                        difficulty_level=q_data.get('difficulty_level'),
                        subject_category=q_data.get('subject_category'),
                        tags=q_data.get('tags'),
                        image=q_data.get('image'),
                        creator_ip=q_data.get('creator_ip', '127.0.0.1'),
                        status='待审核'
                    )
                    db.add(new_question)
                    imported_count += 1
                except Exception as e:
                    failed_count += 1
                    errors.append(f"题目导入失败: {str(e)}")
            
            db.commit()
            
            return JSONResponse({
                "message": "导入完成",
                "imported": imported_count,
                "failed": failed_count,
                "errors": errors
            })
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"JSON文件解析失败: {str(e)}")
    
    elif file.filename.endswith(('.xlsx', '.xls')):
        # 从Excel导入
        try:
            df = pd.read_excel(file.file)
            questions_data = df.to_dict('records')
            
            imported_count = 0
            failed_count = 0
            errors = []
            
            for q_data in questions_data:
                try:
                    # 处理options字段
                    options = q_data.get('options', [])
                    if isinstance(options, str):
                        try:
                            options = json.loads(options)
                        except:
                            options = []
                    elif not isinstance(options, list):
                        options = []
                    
                    # 创建新题目
                    new_question = question_models.Question(
                        type=q_data.get('type'),
                        content=q_data.get('content'),
                        options=json.dumps(options),
                        correct_answer=q_data.get('correct_answer'),
                        explanation=q_data.get('explanation'),
                        difficulty=q_data.get('difficulty', 1.0),
                        language=q_data.get('language'),
                        difficulty_level=q_data.get('difficulty_level'),
                        subject_category=q_data.get('subject_category'),
                        tags=q_data.get('tags'),
                        image=q_data.get('image'),
                        creator_ip=q_data.get('creator_ip', '127.0.0.1'),
                        status='待审核'
                    )
                    db.add(new_question)
                    imported_count += 1
                except Exception as e:
                    failed_count += 1
                    errors.append(f"题目导入失败: {str(e)}")
            
            db.commit()
            
            return JSONResponse({
                "message": "导入完成",
                "imported": imported_count,
                "failed": failed_count,
                "errors": errors
            })
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Excel文件解析失败: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="不支持的文件格式，请上传JSON或Excel文件")
