"""Run once to create tables in database
    Tip. run it as module using
    python -m app.db.create
"""

from app.db.database import engine
from app.db.models import Base

Base.metadata.create_all(bind=engine)
