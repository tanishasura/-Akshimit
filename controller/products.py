from sqlalchemy.orm import Session
from models.products import Product
from fastapi import HTTPException
from sqlalchemy import or_

def create_product(db: Session, product_data: dict):
    """
    Creates a new product record in the database.
    """
    try:
        # default GST 
        if "gst" not in product_data:
            product_data["gst"] = 5.0
            
        # Generate a unique product ID 
        if "id" not in product_data or not product_data["id"]:
            from models.products import generate_product_id
            product_data["id"] = generate_product_id()

        new_product = Product(**product_data)
        
        # Add to the database session, commit the transaction, and refresh to get updated attributes
        db.add(new_product)
        db.commit()
        db.refresh(new_product) 
        return new_product
    except Exception as e:
        # Roll back the transaction in case of an error to prevent DB inconsistency
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")
    



def get_all_products(db: Session, search: str = None, size: str = None, color: str = None, 
                     section: str = None, brand: str = None, sort: str = None, gst: float = None):
    """
    Retrieves and filters products based on multiple search and categorization parameters.
    """
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
    """
    Updates specific attributes of an existing product.
    """
    # Look up the product by its unique ID
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Update attributes  based on the dictionary keys
    for key, value in update_data.items():
        setattr(db_product, key, value)

    # Save changes to the database 
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: str):
    """
    Deletes a product from the database by its ID.
    """
    # Look up the product by its unique ID
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Remove from session and commit changes
    db.delete(db_product)
    db.commit()
    return {"message": f"Product {product_id} deleted successfully"}

def restock_product(db: Session, product_id: str, quantity: int):
    """
    Increments the stock quantity of a specific product.
    """
    # Look up the product by its unique ID
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Increment the existing stock quantity
    db_product.stock_qty += quantity
    db.commit()
    db.refresh(db_product)
    return db_product

def get_product_by_id(db: Session, identifier: str):
    """
    Retrieves a single product matching either the exact/partial ID or name.
    """
    # Look up the product using a case-insensitive check against both ID and Name
    db_product = db.query(Product).filter(
        or_(
            Product.id.ilike(identifier),
            Product.name.ilike(identifier)
        )
    ).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return db_product