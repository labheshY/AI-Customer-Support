import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_size=10,         # Minimum number of ready connections
    max_overflow=20,     # Maximum temporary extra connections
    pool_timeout=30,     # Wait up to 30s for a connection
    pool_pre_ping=True   # Refresh stale connections automatically
)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()