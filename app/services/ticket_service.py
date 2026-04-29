from app.db.database import SessionLocal
from app.db.models import Ticket, Orders

def update_order_status(db, order_id: str, new_status: str):
    order = db.query(Orders).filter_by(order_id=order_id).first()
    if order:
        order.status = new_status
        return True
    return False

def update_ticket_status(ticket_id: str, status: str):
    db = SessionLocal()
    try:
        ticket = db.query(Ticket).filter_by(ticket_id=ticket_id).first()

        if ticket:
            ticket.status = status
            
            # If ticket is resolved and has an order_id, update order status
            if status == "resolved" and ticket.order_id:
                update_order_status(db, ticket.order_id, "Delivered")
                
            db.commit()
            return {"message": "Ticket updated and synchronized."}
        
        return {"error": "Ticket not found."}
    finally:
        db.close()