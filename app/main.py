from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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
from app.services.auth import verify_password, create_access_token, decode_access_token

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# ------ Setup ------

security = HTTPBearer(auto_error=False)

def get_current_user(auth: HTTPAuthorizationCredentials = Depends(security)):
    if not auth:
        return None
    payload = decode_access_token(auth.credentials)
    return payload

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Add your production domain here later
]

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
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
        if user and verify_password(data.password, user.hashed_password):
            token = create_access_token(data={"sub": user.user_id, "name": user.name})
            return {
                "status": "ok",
                "user_id": user.user_id,
                "name": user.name,
                "access_token": token,
                "token_type": "bearer"
            }
        raise HTTPException(status_code=401, detail="Invalid credentials")
    finally:
        db.close()

@app.post("/ask")
@limiter.limit("10/minute")
async def ask_question(request_obj: Request, request: QueryRequest, user_data: Optional[dict] = Depends(get_current_user)):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query is empty")

    # Use user_id from JWT if available, otherwise fallback to Guest
    user_id = user_data.get("sub") if user_data else "Guest"
    session_id = request.session_id or str(uuid.uuid4())
    
    from app.services.agent import run_agent_stream
    
    return StreamingResponse(
        run_agent_stream(request.query, session_id, user_id),
        media_type="text/event-stream"
    )


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
    # In production, this should also use hashing, but for now we'll issue a secure JWT
    if data.password == admin_pass:
        token = create_access_token(data={"sub": "admin", "is_admin": True})
        return {
            "status": "ok", 
            "access_token": token,
            "token_type": "bearer"
        }
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