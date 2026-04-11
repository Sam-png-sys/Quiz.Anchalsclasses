from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.jwt_handler import decode_token

security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials

        # Strip "Bearer " prefix if accidentally included
        if token.startswith("Bearer "):
            token = token.split(" ")[1]

        payload = decode_token(token)
        return payload

    except Exception as e:
        print("AUTH ERROR:", e)
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def admin_only(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def student_only(user=Depends(get_current_user)):
    if user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    return user