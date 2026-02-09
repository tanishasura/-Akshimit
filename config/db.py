import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DATABASE_URL = "postgresql://akshmit_db_v2_user:ziVMah5SYv9RUasyaubYOUYfcKlweM8R@dpg-d64vlma4d50c73eqm9s0-a.virginia-postgres.render.com/akshmit_db_v2"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def run_migration():
    try:
        with engine.connect() as conn:
            print(" Dropping old table...")
            conn.execute(text("DROP TABLE IF EXISTS transactions CASCADE;"))
            conn.commit()
            
            print(" Creating fresh table structure...")
            from models.transaction import Transaction
            Base.metadata.create_all(bind=engine)
            
            print(" SUCCESS: Your database is clean and ready!")
    except Exception as e:
        print(f" Migration Error: {e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()