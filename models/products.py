from sqlalchemy import Column, Integer, String, Float
from config.db import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True) 
    
    name = Column(String, nullable=False)
    material = Column(String, nullable=False)
    color = Column(String, nullable=False)
    size = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    section = Column(String, nullable=False)
    type = Column(String, nullable=False)
    
   
    price = Column(Float, nullable=False)
    stock_qty = Column(Integer, default=0)





