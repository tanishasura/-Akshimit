from sqlalchemy.orm import Session, joinedload
from models.transaction import Transaction, TransactionItem
from models.products import Product
from fastapi import HTTPException

def get_all_transactions(db: Session):
    return db.query(Transaction).options(joinedload(Transaction.items)).all()

def create_bulk_transaction(db: Session, data: dict):
    try:
        new_transaction = Transaction(
            id=data.get('id'),
            date=data.get('date'),
            amount=data.get('amount'),
            method=data.get('method'),
            customer_name=data.get('customer_name'),
            customer_phone=data.get('customer_phone')
        )
        
        db.add(new_transaction)
        
        for item in data['items']:
            product = db.query(Product).filter(Product.id == item['id']).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item['id']} not found")
            
            if product.stock_qty < item['qty']:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
            
            product.stock_qty -= item['qty']
            
            txn_item = TransactionItem(
                transaction_id=new_transaction.id,
                product_id=product.id,
                product_name=product.name,
                qty=item['qty'],
                price=product.price,
                refunded_qty=0
            )
            db.add(txn_item)

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
        

def process_item_refund(db: Session, txn_id: str, item_id: int, refund_data: dict):
    item = db.query(TransactionItem).filter(TransactionItem.id == item_id, TransactionItem.transaction_id == txn_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Transaction item not found")
        
    refund_qty = refund_data.get("refund_qty", 1)
    if item.qty - item.refunded_qty < refund_qty:
        raise HTTPException(status_code=400, detail="Cannot refund more than available quantity")
        
    item.refunded_qty += refund_qty
    item.refund_reason = refund_data.get("refund_reason") or item.refund_reason
    
    # Optionally update overall transaction status
    txn = item.transaction
    all_fully_refunded = all(i.qty == i.refunded_qty for i in txn.items)
    any_refunded = any(i.refunded_qty > 0 for i in txn.items)
    
    if all_fully_refunded:
        txn.status = "Refunded"
    elif any_refunded:
        txn.status = "Partially Refunded"
        
    # Keep transaction-level reason as fallback
    txn.refund_reason = refund_data.get("refund_reason") or txn.refund_reason

    db.commit()
    db.refresh(item)
    return item

def process_refund(db: Session, txn_id: str, refund_data: dict):
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    txn.status = "Refunded"
    txn.refund_reason = refund_data.get("refund_reason")
    
    db.commit()
    db.refresh(txn)
    return txn