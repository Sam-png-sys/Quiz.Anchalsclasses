import os

from app.config.database import users_collection
from app.utils.hash import hash_password, verify_password
from app.utils.jwt_handler import create_token

def register_user(data):
    if users_collection.find_one({"email": data["email"]}):
        return {"error": "User already exists"}

    data["password"] = hash_password(data["password"])
    users_collection.insert_one(data)

    return {"message": "User registered"}


def login_user(data):
    user = users_collection.find_one({"email": data["email"]})

    if not user or not verify_password(data["password"], user["password"]):
        return {"error": "Invalid credentials"}

    token = create_token({
        "user_id": str(user["_id"]),
        "role": user["role"]
    })

    return {"token": token}

print("JWT SECRET (auth_service):", os.getenv("JWT_SECRET"))