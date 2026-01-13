from fastapi import FastAPI
from routes.products import router as product_router
from config.db import engine, Base


# To create Table
Base.metadata.create_all(bind=engine)

app = FastAPI()

# ROUTES
app.include_router(product_router)

@app.get("/")
def home():
    return {"status": "Server is running"}

