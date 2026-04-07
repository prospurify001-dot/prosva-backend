from fastapi import FastAPI
from app.orders import router as orders_router
from app.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="PROSVA Food Delivery API",
    version="0.2.0"
)

@app.get("/")
def root():
    return "API is running"

app.include_router(orders_router)
app.include_router(auth_router)
