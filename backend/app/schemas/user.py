from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from pydantic.networks import EmailStr


class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: str = "user"


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    expires_at: Optional[str] = None
    user: Optional[dict] = None


class SessionValidation(BaseModel):
    valid: bool
    token_refreshed: bool
    new_token: Optional[str] = None
    expires_at: Optional[str] = None
    user: Optional[dict] = None


class AuthCheck(BaseModel):
    authenticated: bool
    expires_at: Optional[str] = None


class TokenData(BaseModel):
    username: Optional[str] = None
