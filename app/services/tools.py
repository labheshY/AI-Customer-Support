import json
from pathlib import Path
from langchain_community.tools import tool
from app.services.rag import retrieve_and_generate
from app.db.database import SessionLocal
from app.db.models import Ticket
from app.services.ticket_service import update_ticket_status
from datetime import datetime, timezone
UTC = timezone.utc
import uuid
from app.db.models import Ticket, Orders, User

# Tools logic

# Define a tool to get order status
def get_order_status(order_id: str) -> str:
    db = SessionLocal()
    try:
        order = db.query(Orders).filter_by(order_id=order_id).first()
        if order:
            return {
                "order_id": order.order_id,
                "status": order.status,
                "eta": order.eta
            }
        return f"Order {order_id} not found."
    finally:
        db.close()

# Define a tool to get user information
def get_user_details(user_id: str) -> str:
    db = SessionLocal()
    try:
        user = db.query(User).filter_by(user_id=user_id).first()
        if user:
            return {
                "user_id": user.user_id,
                "name": user.name,
                "email": user.email
            }
        return f"User {user_id} not found."
    finally:
        db.close()

# Raise tickets for order issues
def create_ticket(issue: str, order_id: str = None, user_id: str = None) -> str:
    # This would create a ticket in a support system
    db = SessionLocal()

    ticket_id = f"T-{datetime.now(UTC).strftime('%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"

    ticket = Ticket(
        ticket_id=ticket_id,
        order_id=order_id,
        user_id=user_id,
        issue=issue,
        status="created"
    )

    db.add(ticket)
    db.commit()
    db.close()

    return {
        "ticket_id": ticket_id,
        "status": "created",
        "order_id": order_id
    }

# Wrap tools with LangChain's tool decorator
@tool("get_order_status")
def tool_get_order_status(order_id: str) -> str:
    """Get order status using order ID like ORD1001"""
    return json.dumps(get_order_status(order_id))

@tool("get_user_details")
def tool_get_user_details(user_id: str) -> str:
    """Get user details using user ID like U001"""
    return json.dumps(get_user_details(user_id))

@tool("create_ticket")
def tool_create_ticket(issue: str, order_id: str = None, user_id: str = None) -> str:
    """Create a support ticket for the customer issue. Use order_id if the issue is related to a specific order."""
    return json.dumps(create_ticket(issue, order_id, user_id))

@tool
def search_knowledge_base(query: str) -> str:
    """Search internal knowledge base (FAQs, policies, help docs). Use this for general questions."""
    return retrieve_and_generate(query)

@tool
def update_ticket_tool(ticket_id: str, status: str):
    """Update ticket status (created, in_progress, resolved)"""
    return str(update_ticket_status(ticket_id, status))