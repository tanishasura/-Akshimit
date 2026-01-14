from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.db import get_db
from controllers.products import create_product, get_all_products, update_product, delete_product
from pydantic import BaseModel

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

@router.post('/products')
def create_product_api(product: ProductCreate, db: Session = Depends(get_db)):
    return create_product(db, product.dict())


@router.get("/getAllProducts")
def fetch_all_products(db:Session = Depends(get_db)):
    return get_all_products(db)


class ProductUpdate(BaseModel):
    price: float
    stock_qty: int

@router.put('/updateProduct/{product_id}')
def update_product_api(
    product_id: str, 
    update_data: ProductUpdate, 
    db: Session = Depends(get_db)
):
    return update_product(
        db, 
        product_id, 
        update_data.price, 
        update_data.stock_qty
    )


@router.delete('/deleteProduct/{product_id}')
def delete_product_api(product_id: str, db: Session = Depends(get_db)):
    return delete_product(db, product_id)