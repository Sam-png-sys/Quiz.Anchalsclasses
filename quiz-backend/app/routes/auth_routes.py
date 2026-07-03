from fastapi import APIRouter, HTTPException
from app.schemas.user_schema import UserRegister, UserLogin, VerifyOTP
from app.services.otp_service import generate_otp, verify_otp
from app.config.database import users_collection
from app.utils.hash import hash_password, verify_password
from app.utils.jwt_handler import create_token
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Auth"])

from app.config.database import users_collection, temp_user_collection, login_session_collection


# =========================
# SIGNUP
# =========================
@router.post("/signup")
def signup(data: UserRegister):
    if users_collection.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="User already exists")

    temp_user_collection.update_one(
        {"email": data.email},
        {"$set": data.dict()},
        upsert=True
    )

    generate_otp(data.email)

    return {"message": "OTP sent", "email": data.email}


# =========================
# LOGIN
# =========================
@router.post("/login")
def login(data: UserLogin):
    #print("EMAIL:", data.email)
    #print("PASSWORD:", data.password)
    user = users_collection.find_one({"email": data.email})

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    login_session_collection.update_one(
        {"email": data.email},
        {"$set": {"user_id": str(user["_id"])}},
        upsert=True
    )

    generate_otp(data.email)

    return {"message": "OTP sent", "email": data.email}


# =========================
# RESEND OTP
# =========================
@router.post("/resend-otp")
def resend_otp(data: dict):
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    generate_otp(email)
    return {"message": "OTP resent"}


# =========================
# VERIFY OTP
# =========================
@router.post("/verify-otp")
def verify(data: VerifyOTP):

    if not verify_otp(data.email, data.otp):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # ================= LOGIN FLOW =================
    login_session = login_session_collection.find_one({"email": data.email})
    if login_session:
        user_id = login_session["user_id"]

        user = users_collection.find_one({"_id": ObjectId(user_id)})

        token = create_token({
            "user_id": str(user["_id"]),
            "role": user["role"],
            "name": user.get("name"),   
            "email": user.get("email"),
            "currentCourse": user.get("currentCourse", ""),
            "collegeName": user.get("collegeName", ""),
        })

        login_session_collection.delete_one({"email": data.email})

        return {"access_token": token}

    # ================= SIGNUP FLOW =================
    temp = temp_user_collection.find_one({"email": data.email})

    if not temp:
        raise HTTPException(status_code=400, detail="Signup session expired")

    temp["password"] = hash_password(temp["password"])

    # duplicate checks
    if users_collection.find_one({"phone": temp.get("phone")}):
        raise HTTPException(status_code=400, detail="Phone already registered")

    if users_collection.find_one({"email": temp.get("email")}):
        raise HTTPException(status_code=400, detail="Email already registered")

    # safe insert
    try:
        result = users_collection.insert_one(temp)
    except Exception:
        raise HTTPException(status_code=400, detail="User already exists")

    temp_user_collection.delete_one({"email": data.email})

    token = create_token({
        "user_id": str(result.inserted_id),
        "role": temp["role"],
        "name": temp.get("name"),   
        "email": temp.get("email"),
        "currentCourse": temp.get("currentCourse", ""),
        "collegeName": temp.get("collegeName", ""),
    })

    return {"access_token": token}


# =========================
# FORGOT PASSWORD
# =========================
@router.post("/forgot-password")
def forgot_password(data: dict):
    identifier = (data.get("email") or data.get("identifier") or data.get("username") or "").strip()
    if not identifier:
        raise HTTPException(status_code=400, detail="Email is required")

    user = users_collection.find_one({"email": identifier})
    if not user:
        user = users_collection.find_one({"name": identifier})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    email = user.get("email")
    generate_otp(email)

    return {"message": "OTP sent", "email": email}


# =========================
# RESET PASSWORD
# =========================
@router.post("/reset-password")
def reset_password(data: dict):
    email = data.get("email")
    otp = data.get("otp")
    password = data.get("password", "")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    if not verify_otp(email, otp):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    users_collection.update_one(
        {"email": email},
        {"$set": {"password": hash_password(password)}}
    )

    return {"message": "Password reset successful"}

