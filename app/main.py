from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

import os
from app.services.agent import run_agent
from app.services.ticket_service import update_ticket_status
from app.db.database import SessionLocal
from app.db.models import Ticket, ChatMessage, User
# ------ Setup ------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------ Models ------

class QueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None


class AdminLogin(BaseModel):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# ------ API ------

@app.post("/user/login")
def user_login(data: UserLogin):
    db = SessionLocal()
    try:
        user = db.query(User).filter_by(email=data.email).first()
        if user and user.hashed_password == data.password: # Simple check for now
            return {
                "status": "ok",
                "user_id": user.user_id,
                "name": user.name
            }
        raise HTTPException(status_code=401, detail="Invalid credentials")
    finally:
        db.close()

@app.post("/ask")
def ask_question(request: QueryRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query is empty")

    session_id = request.session_id or str(uuid.uuid4())
    
    response_text = run_agent(request.query, session_id=session_id, user_id=request.user_id)
    
    return {
        "response": response_text,
        "session_id": session_id
    }


@app.put("/ticket/{ticket_id}")
def update_ticket(ticket_id: str, status: str):
    return update_ticket_status(ticket_id, status)


@app.get("/tickets")
def get_tickets():
    db = SessionLocal()
    try:
        tickets = db.query(Ticket).all()
        return tickets
    finally:
        db.close()


@app.get("/chats/{session_id}")
def get_chat(session_id: str):   
    db = SessionLocal()
    try:
        chats = db.query(ChatMessage).filter_by(session_id=session_id).order_by(ChatMessage.timestamp.asc()).all()

        return [
            {"role": c.role, "content": c.content}
            for c in chats
        ]
    finally:
        db.close()


# 🔥 UPDATED: Sessions endpoint (now filtered by user_id)

@app.get("/sessions")
def get_sessions(user_id: Optional[str] = None):
    db = SessionLocal()
    try:
        query = db.query(ChatMessage.session_id).distinct()
        if user_id:
            query = query.filter(ChatMessage.user_id == user_id)
        sessions = query.all()
        return [s[0] for s in sessions]
    finally:
        db.close()


class AdminCreateTicket(BaseModel):
    issue: str
    order_id: Optional[str] = None

@app.post("/admin/create-ticket")
def admin_create_ticket(data: AdminCreateTicket):
    from app.services.tools import create_ticket
    return create_ticket(data.issue, order_id=data.order_id)

@app.post("/admin/login")
def admin_login(data: AdminLogin):
    admin_pass = os.getenv("ADMIN_PASSWORD", "admin123")
    if data.password == admin_pass:
        return {"status": "ok"}
    raise HTTPException(status_code=401, detail="Invalid password")

@app.delete("/session/{session_id}")
def delete_session(session_id: str):
    db = SessionLocal()
    try:
        db.query(ChatMessage).filter_by(session_id=session_id).delete()
        db.commit()
        return {"status": "deleted"}
    finally:
        db.close()