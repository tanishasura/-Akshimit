from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.db import get_db
from controller.products import create_product, get_all_products, get_product_by_id, update_product, delete_product
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ProductCreate(BaseModel):
    name: str
    material: str
    color: str
    size: str
    brand: str
    section: str
    type: str
    price: float
    stock_qty: int
    # gst: Optional[float] = 5.0

class ProductUpdate(BaseModel):
    price: Optional[float] = None
    stock_qty: Optional[int] = None
    # gst: Optional[float] = None

@router.get('/products')
def get_products(
    search: Optional[str] = None, 
    size: Optional[str] = None,
    color: Optional[str] = None,
    section: Optional[str] = None,
    brand: Optional[str] = None,
    sort: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_all_products(
        db, 
        search=search, 
        size=size, 
        color=color, 
        section=section, 
        brand=brand,
        sort=sort
    )

@router.get('/products/{identifier}')
def get_product(identifier: str, db: Session = Depends(get_db)):
    return get_product_by_id(db, identifier)

@router.post('/products')
def create_product_api(product: ProductCreate, db: Session = Depends(get_db)):
    return create_product(db, product.dict())

@router.put('/products/{product_id}')
def update_product_api(product_id: str, product: ProductUpdate, db: Session = Depends(get_db)):
    return update_product(db, product_id, product.dict(exclude_unset=True))

@router.delete('/products/{product_id}')
def delete_product_api(product_id: str, db: Session = Depends(get_db)):
    return delete_product(db, product_id)