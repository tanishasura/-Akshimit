from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from routes.products import router as product_router
from routes.transaction import router as transaction_router 
from config.db import engine, Base

# Create Tables in DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management System")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)

# ROUTES
app.include_router(product_router, tags=["Products"])
app.include_router(transaction_router, tags=["Transactions"]) 

@app.get("/")
def home():
    return {"status": "Server is running"}