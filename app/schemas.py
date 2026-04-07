# app/schemas.py
from pydantic import BaseModel
from enum import Enum
from typing import Optional

# =======================
# ROLE ENUM
# =======================
class Role(str, Enum):
    admin = "admin"
    restaurant = "restaurant"
    rider = "rider"
    customer = "customer"

# =======================
# USER SCHEMAS
# =======================
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: Role

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: Role

    class Config:
        orm_mode = True

# =======================
# ORDER SCHEMAS
# =======================
# For creating an order
class OrderCreate(BaseModel):
    item: str
    price: float
    restaurant_id: Optional[int] = None
    status: Optional[str] = "pending"

# For returning an order (with IDs)
class OrderResponse(BaseModel):
    id: int
    item: str
    price: float
    status: str
    customer_id: int
    restaurant_id: Optional[int] = None
    rider_id: Optional[int] = None

    class Config:
        orm_mode = True

# =======================
# TOKEN SCHEMA (for auth)
# =======================
class Token(BaseModel):
    access_token: str
    token_type: str
