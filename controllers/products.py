from sqlalchemy.orm import Session
from models.products import Product

def create_product(db: Session, product_data: dict):
    print(f"Received data: {product_data}")

    try:
        new_product = Product(**product_data)
        print("Model created successfully.")
        
        db.add(new_product)
        print(f"Attempting to COMMIT to Render Postgres (ID: {new_product.id})...")
        
        db.commit()
        print(" Database Commit SUCCESSFUL!")
        
        db.refresh(new_product)
        print(f"Final Product saved in DB: {new_product.name}")
        return new_product

    except Exception as e:
        print("DATABASE ERROR occurred!")
        print(f"Error details: {str(e)}")
        db.rollback() 
        raise e

    finally:
        print(" DB DEBUG END ")