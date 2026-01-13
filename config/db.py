from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://akshmit_db_user:tutWMMUvmGBQE6ka50I99X0BCvfhkrYR@dpg-d5h49u14tr6s739bg0e0-a.virginia-postgres.render.com/akshmit_db"

# try:
engine = create_engine(DATABASE_URL)


SessionLocal = sessionmaker(autocommit= False, autoflush=False, bind=engine)
Base= declarative_base()

def get_db():
    db =  SessionLocal()
    try:
        yield db
    finally: 
        db.close()
    # with engine.connect() as connection:
    #     result = connection.execute(text("SELECT version();"))
    #     print("Connection Successful!")
    #     print(f"Postgres Version: {result.fetchone()[0]}")
# except Exception as e:
#     print("Connection Failed!")
#     print(f"Error: {e}")