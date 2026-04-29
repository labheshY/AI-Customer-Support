"""Run this to DROP all tables and recreate them from scratch.
    WARNING: This will delete ALL data in the database.
    Run as: python -m app.db.recreate
"""

from app.db.database import engine
from app.db.models import Base

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)

print("Creating all tables...")
Base.metadata.create_all(bind=engine)

print("Database recreated successfully.")
