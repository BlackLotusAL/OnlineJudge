from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.db import get_db
from app.schemas import ticket as ticket_schemas
from app.models import ticket as ticket_models

router = APIRouter()

@router.get("/")
def get_tickets(db: Session = Depends(get_db), skip: int = 0, limit: int = 100, status: str = None):
    return {"message": f"Get tickets, skip: {skip}, limit: {limit}, status: {status}"}

@router.get("/{ticket_id}")
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    return {"message": f"Get ticket {ticket_id}"}

@router.post("/")
def create_ticket(ticket: ticket_schemas.TicketCreate, db: Session = Depends(get_db)):
    return {"message": "Create ticket"}

@router.put("/{ticket_id}")
def update_ticket(ticket_id: int, ticket: ticket_schemas.TicketUpdate, db: Session = Depends(get_db)):
    return {"message": f"Update ticket {ticket_id}"}
