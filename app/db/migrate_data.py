import json
from pathlib import Path
from app.db.database import SessionLocal
from app.db.models import User, Orders, Base
from app.db.database import engine

def migrate():
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    data_path = Path(__file__).resolve().parents[2] / "data" / "structured"
    
    # Migrate Users
    users_file = data_path / "users.json"
    if users_file.exists():
        with open(users_file, "r") as f:
            users_data = json.load(f)
            for u in users_data:
                # Check if user already exists
                existing = db.query(User).filter_by(user_id=u["user_id"]).first()
                if not existing:
                    user = User(
                        user_id=u["user_id"],
                        name=u["name"],
                        email=u["email"],
                        hashed_password="default_hashed_password" # In production, use real hashing
                    )
                    db.add(user)
    
    # Migrate Orders
    orders_file = data_path / "orders.json"
    if orders_file.exists():
        with open(orders_file, "r") as f:
            orders_data = json.load(f)
            for o in orders_data:
                existing = db.query(Orders).filter_by(order_id=o["order_id"]).first()
                if not existing:
                    order = Orders(
                        order_id=o["order_id"],
                        user_id=o["user_id"],
                        status=o["status"],
                        eta=o["eta"],
                        product_name="Generic Product", # Placeholder
                        price=0 # Placeholder
                    )
                    db.add(order)
    
    db.commit()
    db.close()
    print("Migration completed successfully.")

if __name__ == "__main__":
    migrate()
