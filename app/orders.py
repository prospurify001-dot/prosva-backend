# app/orders.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Order as OrderModel, User as UserModel
from app.schemas import OrderCreate, OrderResponse
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from typing import List, Optional

# JWT config must match auth.py
SECRET_KEY = "YOUR_SECRET_KEY_HERE"
ALGORITHM = "HS256"

router = APIRouter(prefix="/orders", tags=["Orders"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Helper: Get current user from JWT
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email: str = payload.get("sub")  # <-- using email
        if user_email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(UserModel).filter(UserModel.email == user_email).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Pydantic schemas
from pydantic import BaseModel

class OrderCreate(BaseModel):
    item: str
    price: float
    restaurant_id: Optional[int] = None
    status: Optional[str] = "pending"

class OrderResponse(BaseModel):
    id: int
    item: str
    price: float
    status: str
    customer_id: int
    restaurant_id: Optional[int]
    rider_id: Optional[int]

    class Config:
        orm_mode = True

# Routes
@router.get("/", response_model=List[OrderResponse])
def list_orders(db: Session = Depends(get_db)):
    return db.query(OrderModel).all()

@router.post("/", response_model=OrderResponse)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_order = OrderModel(
        item=order.item,
        price=order.price,
        status=order.status,
        customer_id=current_user.id,
        restaurant_id=order.restaurant_id
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@router.patch("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if current_user.role not in ["admin", "restaurant", "rider"]:
        raise HTTPException(status_code=403, detail="Not authorized to update orders")

    order.status = status
    db.commit()
    db.refresh(order)
    return order

@router.delete("/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete orders")

    db.delete(order)
    db.commit()
    return {"message": "Order deleted"}
