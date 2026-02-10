from sqlalchemy.orm import Session
from models.transaction import Transaction
from models.products import Product
from fastapi import HTTPException

def get_all_transactions(db: Session):
    return db.query(Transaction).all()

def create_bulk_transaction(db: Session, data: dict):
    try:
        for item in data['items']:
            product = db.query(Product).filter(Product.id == item['id']).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item['id']} not found")
            
            if product.stock_qty < item['qty']:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
            
            product.stock_qty -= item['qty']

        new_transaction = Transaction(
            id=data.get('id'),
            date=data.get('date'),
            amount=data.get('amount'),
            method=data.get('method'),
            customer_name=data.get('customer_name'),
            customer_phone=data.get('customer_phone')
        )
        
        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)
        return new_transaction

    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        print(f"DATABASE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error: Check terminal")
        

def process_refund(db: Session, txn_id: str, refund_data: dict):
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    txn.status = "Refunded"
    txn.refund_reason = refund_data.get("refund_reason")
    
    db.commit()
    db.refresh(txn)
    return txn