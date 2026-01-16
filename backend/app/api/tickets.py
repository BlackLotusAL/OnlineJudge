from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.models.db import get_db
from app.schemas import ticket as ticket_schemas
from app.models import ticket as ticket_models
from datetime import datetime

router = APIRouter()

@router.get("/")
def get_tickets(db: Session = Depends(get_db), skip: int = 0, limit: int = 100, status: str = None):
    query = db.query(ticket_models.Ticket)
    
    if status:
        query = query.filter(ticket_models.Ticket.status == status)
    
    tickets = query.offset(skip).limit(limit).all()
    return tickets

@router.get("/{ticket_id}")
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(ticket_models.Ticket).filter(ticket_models.Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return ticket

@router.post("/")
def create_ticket(ticket: ticket_schemas.TicketCreate, db: Session = Depends(get_db)):
    db_ticket = ticket_models.Ticket(**ticket.model_dump())
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@router.put("/{ticket_id}")
def update_ticket(ticket_id: int, ticket: ticket_schemas.TicketUpdate, db: Session = Depends(get_db)):
    db_ticket = db.query(ticket_models.Ticket).filter(ticket_models.Ticket.id == ticket_id).first()
    
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    for field, value in ticket.model_dump(exclude_unset=True).items():
        setattr(db_ticket, field, value)
    
    if db_ticket.status == 'resolved' and not db_ticket.resolved_at:
        db_ticket.resolved_at = datetime.now()
    
    db.commit()
    db.refresh(db_ticket)
    return db_ticket
