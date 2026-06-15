from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=10)
    password: str
    role: str
    currentCourse: Optional[str] = ""
    collegeName: Optional[str] = ""


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class AdminCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=10)
    password: str
    creationPassword: str
