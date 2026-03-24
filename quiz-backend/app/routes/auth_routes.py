from fastapi import APIRouter
from app.schemas.user_schema import UserRegister, UserLogin
from app.services.auth_service import register_user, login_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
def register(data: UserRegister):
    return register_user(data.dict())


@router.post("/login")
def login(data: UserLogin):
    return login_user(data.dict())