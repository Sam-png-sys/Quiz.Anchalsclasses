from fastapi import APIRouter, HTTPException

from app.schemas.user_schema import (
    UserRegister,
    UserLogin,
    SendOTP,
    VerifyOTP
)

from app.services.auth_service import (
    register_user,
    login_user,
    create_or_get_user_and_token
)

from app.services.otp_service import generate_otp, verify_otp

router = APIRouter(prefix="/auth", tags=["Auth"])


#  EMAIL AUTH

@router.post("/register")
def register(data: UserRegister):
    return register_user(data.dict())


@router.post("/login")
def login(data: UserLogin):
    return login_user(data.dict())


#  OTP AUTH

@router.post("/send-otp")
def send_otp(data: SendOTP):
    generate_otp(data.phone)
    return {"message": "OTP sent successfully"}


@router.post("/verify-otp")
def verify(data: VerifyOTP):
    is_valid = verify_otp(data.phone, data.otp)

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    token = create_or_get_user_and_token(data.phone, data.name)

    return {
        "access_token": token,
        "token_type": "bearer"
    }