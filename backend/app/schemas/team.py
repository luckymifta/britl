from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class TeamMemberBase(BaseModel):
    name: str
    position: str
    bio: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = True
    order_position: Optional[int] = 0
    image_url: Optional[str] = None


class TeamMemberCreate(TeamMemberBase):
    pass


class TeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    bio: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None
    order_position: Optional[int] = None
    image_url: Optional[str] = None


class TeamMember(TeamMemberBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
