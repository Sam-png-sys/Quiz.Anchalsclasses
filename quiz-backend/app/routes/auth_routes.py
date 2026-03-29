from fastapi import APIRouter, HTTPException
from app.schemas.user_schema import UserRegister, UserLogin, VerifyOTP
from app.services.otp_service import generate_otp, verify_otp
from app.config.database import users_collection
from app.utils.hash import hash_password, verify_password
from app.utils.jwt_handler import create_token
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Auth"])

temp_users = {}
login_sessions = {}


@router.post("/signup")
def signup(data: UserRegister):
    if users_collection.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="User exists")

    temp_users[data.email] = data.dict()
    generate_otp(data.email)

    return {"message": "OTP sent", "email": data.email}


@router.post("/login")
def login(data: UserLogin):
    user = users_collection.find_one({"email": data.email})

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    login_sessions[data.email] = str(user["_id"])

    generate_otp(data.email)

    return {"message": "OTP sent", "email": data.email}


@router.post("/verify-otp")
def verify(data: VerifyOTP):

    if not verify_otp(data.email, data.otp):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if data.email in login_sessions:
        user_id = login_sessions[data.email]

        user = users_collection.find_one({"_id": ObjectId(user_id)})

        token = create_token({
            "user_id": str(user["_id"]),
            "role": user["role"]
        })

        del login_sessions[data.email]

        return {"access_token": token}

    temp = temp_users.get(data.email)

    if not temp:
        raise HTTPException(status_code=400, detail="Signup expired")

    temp["password"] = hash_password(temp["password"])

    result = users_collection.insert_one(temp)

    del temp_users[data.email]

    token = create_token({
        "user_id": str(result.inserted_id),
        "role": temp["role"]
    })

    return {"access_token": token}


@router.post("/forgot-password")
def forgot_password(data: dict):
    email = data.get("email")

    user = users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    generate_otp(email)

    return {"message": "OTP sent"}


@router.post("/reset-password")
def reset_password(data: dict):
    email = data.get("email")
    otp = data.get("otp")
    password = data.get("password")

    if not verify_otp(email, otp):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    users_collection.update_one(
        {"email": email},
        {"$set": {"password": hash_password(password)}}
    )

    return {"message": "Password reset successful"}