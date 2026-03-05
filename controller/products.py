from sqlalchemy.orm import Session
from models.products import Product
from fastapi import HTTPException
from sqlalchemy import or_

def create_product(db: Session, product_data: dict):
    try:
        if "gst" not in product_data:
            product_data["gst"] = 5.0
        if "id" not in product_data or not product_data["id"]:
            from models.products import generate_product_id
            product_data["id"] = generate_product_id()

        new_product = Product(**product_data)
        db.add(new_product)
        db.commit()
        db.refresh(new_product) 
        return new_product
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")
    



def get_all_products(db: Session, search: str = None, size: str = None, color: str = None, 
                     section: str = None, brand: str = None, sort: str = None, gst: float = None):
    query = db.query(Product)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(or_(Product.name.ilike(search_filter), Product.id.ilike(search_filter)))
    
    if size and size != "all": query = query.filter(Product.size == size)
    if color and color != "all": query = query.filter(Product.color == color)
    if section and section != "all": query = query.filter(Product.section == section)
    if brand and brand != "all": query = query.filter(Product.brand == brand)
    if gst is not None:
        query = query.filter(Product.gst == gst)

    if sort == "lowToHigh":
        query = query.order_by(Product.price.asc())
    elif sort == "highToLow":
        query = query.order_by(Product.price.desc())
    elif sort == "alphabetical":
        query = query.order_by(Product.name.asc())

    return query.all()





def update_product(db: Session, product_id: str, update_data: dict):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in update_data.items():
        setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: str):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(db_product)
    db.commit()
    return {"message": f"Product {product_id} deleted successfully"}

def restock_product(db: Session, product_id: str, quantity: int):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db_product.stock_qty += quantity
    db.commit()
    db.refresh(db_product)
    return db_product

def get_product_by_id(db: Session, identifier: str):
    db_product = db.query(Product).filter(
        or_(
            Product.id.ilike(identifier),
            Product.name.ilike(identifier)
        )
    ).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return db_product