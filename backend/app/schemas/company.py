from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional
from datetime import datetime


class CompanyBase(BaseModel):
    name: str
    description: Optional[str] = None
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[HttpUrl] = None
    founded_year: Optional[int] = None
    logo_url: Optional[str] = None
    about_image_url: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None  # Change from EmailStr to str for updates
    website: Optional[str] = None  # Change from HttpUrl to str for updates
    founded_year: Optional[int] = None
    logo_url: Optional[str] = None
    about_image_url: Optional[str] = None


class Company(CompanyBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
