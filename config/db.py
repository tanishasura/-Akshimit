from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Cloud PostgreSQL (Commented out for local offline use)
# DATABASE_URL = "postgresql://akshmit_db_v2_user:ziVMah5SYv9RUasyaubYOUYfcKlweM8R@dpg-d64vlma4d50c73eqm9s0-a.virginia-postgres.render.com/akshmit_db_v2?sslmode=require"

# Local SQLite
DATABASE_URL = "sqlite:///./local_billing.db"

# SQLite requires check_same_thread=False for FastAPI multithreading
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from models.products import Product
    from models.transaction import Transaction
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized!")

if __name__ == "__main__":
    init_db()