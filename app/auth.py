# app/auth.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas import UserCreate, UserResponse
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext

router = APIRouter(prefix="/auth", tags=["Auth"])

# In-memory DB
users_db = []
user_id_counter = 1

# Password + JWT config
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "YOUR_SECRET_KEY_HERE"  # Replace with a secure secret in prod
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

class Token(BaseModel):
    access_token: str
    token_type: str

# Helper functions
def get_user_by_email(email: str):
    for user in users_db:
        if user["email"] == email:
            return user
    return None

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(email: str, password: str):
    user = get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.get("hashed_password", password)):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Routes
@router.post("/register", response_model=UserResponse)
def register(user: UserCreate):
    global user_id_counter

    if get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = pwd_context.hash(user.password)

    new_user = {
        "id": user_id_counter,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "hashed_password": hashed_password
    }

    users_db.append(new_user)
    user_id_counter += 1
    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Treat OAuth2 "username" field as email
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}
    )

    return {"access_token": access_token, "token_type": "Bearer"}
