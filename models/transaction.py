from sqlalchemy import Column, String, Float
from config.db import Base
class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True)
    date = Column(String)
    amount = Column(Float)
    method = Column(String)

    customer_name = Column(String, nullable=False) 
    customer_phone = Column(String, nullable=False)
    # status: Optional[str] = "Success"
    # refund_reason: Optional[str] = None
    status = Column(String, default="Success")
    refund_reason = Column(String, nullable=True)