from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.db import get_db
from controller.transaction import create_bulk_transaction, get_all_transactions
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
    items: List[CartItem] 

@router.get('/transactions')
def get_transactions_api(db: Session = Depends(get_db)):

    transactions = get_all_transactions(db)
    return transactions[::-1] 

@router.post('/transactions')
def create_transaction_api(transaction: TransactionCreate, db: Session = Depends(get_db)):

    return create_bulk_transaction(db, transaction.dict())