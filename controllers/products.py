from sqlalchemy.orm import Session
from models.products import Product
from fastapi import HTTPException

def create_product(db: Session, product_data: dict):
    print(f"Received data: {product_data}")

    try:
        new_product = Product(**product_data)
        # print("Model created successfully.")
        
        db.add(new_product)
        # print(f"Attempting to COMMIT to Render Postgres (ID: {new_product.id})...")
        
        db.commit()
        # print("Database Commit SUCCESSFUL!")
        
        db.refresh(new_product)
        # print(f"Final Product saved in DB: {new_product.name}")
        return new_product

    except Exception as e:
        print("DATABASE ERROR occurred!")
        print(f"Error details: {str(e)}")
        db.rollback() 
        raise e

    finally:
        print(" DB DEBUG END ")



def get_all_products(db: Session):
    return db.query(Product).all()



def update_product(db: Session, product_id: str, price: float, stock: int):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    db_product.price = price
    db_product.stock_qty = stock

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



def get_product(db: Session, product_id: str):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return db_product