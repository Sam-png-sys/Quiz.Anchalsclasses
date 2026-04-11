from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.jwt_handler import decode_token

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials

        # remove "Bearer " if present
        if token.startswith("Bearer "):
            token = token.split(" ")[1]
        #print("TOKEN RECEIVED:", token)
        payload = decode_token(token)
        #print("PAYLOAD:", payload)
        return payload
    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=401, detail="Invalid token")


def admin_only(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.jwt_handler import decode_token

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials

        # remove "Bearer " if present
        if token.startswith("Bearer "):
            token = token.split(" ")[1]
        #print("TOKEN RECEIVED:", token)
        payload = decode_token(token)
        #print("PAYLOAD:", payload)
        return payload
    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=401, detail="Invalid token")


def admin_only(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.jwt_handler import decode_token

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials

        if token.startswith("Bearer "):
            token = token.split(" ")[1]

        payload = decode_token(token)
        return payload

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=401, detail="Invalid token")


def admin_only(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


def student_only(user=Depends(get_current_user)):
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student only")
    return user