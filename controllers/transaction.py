from sqlalchemy.orm import Session
from models.transaction import Transaction
from fastapi import HTTPException
from datetime import datetime

def create_transaction(db: Session, transaction_data: dict):
    try:
        new_transaction = Transaction(**transaction_data)
        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)
        return new_transaction
    except Exception as e:
        db.rollback()
        raise e

def get_all_transactions(db: Session):
    return db.query(Transaction).all()
