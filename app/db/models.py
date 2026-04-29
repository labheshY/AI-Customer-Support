from sqlalchemy import Column, String, Integer, Text, DateTime
from datetime import datetime, timezone
UTC = timezone.utc
from app.db.database import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)
    session_id = Column(String, index=True) # Added index for faster history lookups
    user_id = Column(String, nullable=True, index=True) # Added index for user filtering
    role = Column(String) # user/ assistant
    content = Column(Text)
    timestamp = Column(DateTime, default = datetime.now(UTC))

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(String, index=True, unique=True) # Added index and unique constraint
    order_id = Column(String, nullable=True, index=True) # Added index
    user_id = Column(String, nullable=True, index=True) # Added index
    issue = Column(Text)
    status = Column(String) # created / in_progress / resolved

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False, index=True, unique=True) # Added index and unique
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    hashed_password = Column(String, nullable=False)

class Orders(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    order_id = Column(String, nullable=False, unique=True, index=True) # Added index
    user_id = Column(String, nullable=False, index=True) # Added index
    product_name = Column(String, nullable=True) 
    price = Column(Integer, nullable=True)        
    status = Column(String, nullable=False)
    eta = Column(String, nullable=True)
    created_at = Column(DateTime, default = datetime.now(UTC))
    updated_at = Column(DateTime, default = datetime.now(UTC), onupdate = datetime.now(UTC))