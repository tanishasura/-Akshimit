from sqlalchemy import Column, Integer, String, Float
from config.db import Base
import random
import string

def generate_product_id():
    letters = ''.join(random.choices(string.ascii_uppercase, k=4))
    numbers = ''.join(random.choices(string.digits, k=4))
    return f"{letters}{numbers}"


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True, default=generate_product_id)
    
    name = Column(String, nullable=False)
    material = Column(String, nullable=False)
    color = Column(String, nullable=False)
    size = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    section = Column(String, nullable=False)
    type = Column(String, nullable=False)
    
   
    price = Column(Float, nullable=False)
    stock_qty = Column(Integer, default=0)
    # gst = Column(Float, default=5.0)

