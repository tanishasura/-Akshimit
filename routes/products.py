from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.db import get_db
from controllers.products import create_product 
from pydantic import BaseModel

router = APIRouter()

class ProductCreate(BaseModel):
    id: str
    name: str
    material: str
    color: str
    size: str
    brand: str
    section: str
    type: str
    price: float
    stock_qty: int

@router.post('/products')
def create_product_api(product: ProductCreate, db: Session = Depends(get_db)):
    return create_product(db, product.dict())