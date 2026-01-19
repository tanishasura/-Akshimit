from sqlalchemy import Column, String, Float
from config.db import Base
class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True)
    date = Column(String)
    amount = Column(Float)
    method = Column(String)