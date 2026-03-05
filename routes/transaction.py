from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.db import get_db
from controller.transaction import create_bulk_transaction, get_all_transactions, process_refund, process_item_refund
from pydantic import BaseModel
from typing import List

router = APIRouter()

class CartItem(BaseModel):
    id: str
    qty: int

class TransactionCreate(BaseModel):
    id: str          
    date: str        
    amount: float   
    method: str      
    customer_name: str   
    customer_phone: str
    items: List[CartItem] 

@router.get('/transactions')
def get_transactions_api(db: Session = Depends(get_db)):

    transactions = get_all_transactions(db)
    return transactions[::-1] 

@router.post('/transactions')
def create_transaction_api(transaction: TransactionCreate, db: Session = Depends(get_db)):

    return create_bulk_transaction(db, transaction.dict())


@router.put('/transactions/{txn_id}')
def refund_transaction_api(txn_id: str, data: dict, db: Session = Depends(get_db)):
    return process_refund(db, txn_id, data)

@router.put('/transactions/{txn_id}/items/{item_id}/refund')
def refund_transaction_item_api(txn_id: str, item_id: int, data: dict, db: Session = Depends(get_db)):
    return process_item_refund(db, txn_id, item_id, data)