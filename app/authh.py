from fastapi import APIRouter

router = APIRouter()

@router.post("/register")
def register():
    return {"message": "Register endpoint working"}
