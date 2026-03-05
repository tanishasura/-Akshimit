from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from config.db import Base

class TransactionItem(Base):
    __tablename__ = "transactions_items"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id = Column(String, ForeignKey("transactions.id"))
    product_id = Column(String)
    product_name = Column(String)
    qty = Column(Integer)
    price = Column(Float)
    refunded_qty = Column(Integer, default=0)

    transaction = relationship("Transaction", back_populates="items")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True)
    date = Column(String)
    amount = Column(Float)
    method = Column(String)

    customer_name = Column(String, nullable=False) 
    customer_phone = Column(String, nullable=False)
    status = Column(String, default="Success")
    refund_reason = Column(String, nullable=True)

    items = relationship("TransactionItem", back_populates="transaction", cascade="all, delete")