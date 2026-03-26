from fastapi import APIRouter, HTTPException
from app.schemas.user_schema import UserRegister, UserLogin, VerifyOTP
from app.services.otp_service import generate_otp, verify_otp
from app.config.database import users_collection
from app.utils.hash import hash_password, verify_password
from app.utils.jwt_handler import create_token
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Auth"])

# 🔥 TEMP STORAGE
temp_users = {}
login_sessions = {}


# =========================
# SIGNUP (WEB = ADMIN, APP = STUDENT)
# =========================
@router.post("/signup")
def signup(data: UserRegister):
    # 🔥 Prevent duplicate email
    if users_collection.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="User already exists")

    # 🔥 Store temp user
    temp_users[data.phone] = data.dict()

    generate_otp(data.phone)

    print("TEMP USERS:", temp_users)

    return {"message": "OTP sent"}


# =========================
# LOGIN
# =========================
@router.post("/login")
def login(data: UserLogin):
    user = users_collection.find_one({"email": data.email})

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    phone = user.get("phone")

    if not phone:
        raise HTTPException(status_code=400, detail="Phone not found")

    login_sessions[phone] = str(user["_id"])

    generate_otp(phone)

    return {"message": "OTP sent", "phone": phone}


# =========================
# VERIFY OTP
# =========================
@router.post("/verify-otp")
def verify(data: VerifyOTP):

    if not verify_otp(data.phone, data.otp):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # 🔥 LOGIN FLOW
    if data.phone in login_sessions:
        user_id = login_sessions[data.phone]

        user = users_collection.find_one({"_id": ObjectId(user_id)})

        token = create_token({
            "user_id": str(user["_id"]),
            "role": user["role"]
        })

        del login_sessions[data.phone]

        return {"access_token": token}

    # 🔥 SIGNUP FLOW
    temp = temp_users.get(data.phone)

    if not temp:
        raise HTTPException(status_code=400, detail="Signup session expired")

    # 🔥 Prevent duplicate phone
    if users_collection.find_one({"phone": data.phone}):
        raise HTTPException(status_code=400, detail="Phone already registered")

    # 🔥 FORCE ROLE CONTROL (IMPORTANT)
    role = temp.get("role")

    if role not in ["admin", "student"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    temp["password"] = hash_password(temp["password"])
    temp["phone"] = data.phone
    temp["role"] = role

    result = users_collection.insert_one(temp)

    del temp_users[data.phone]

    token = create_token({
        "user_id": str(result.inserted_id),
        "role": role
    })

    return {"access_token": token}