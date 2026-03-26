from pydantic import BaseModel, EmailStr, Field


class SendOTP(BaseModel):
    phone: str = Field(..., min_length=10, max_length=10)


class VerifyOTP(BaseModel):
    phone: str
    otp: str


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=10)
    password: str
    role: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str