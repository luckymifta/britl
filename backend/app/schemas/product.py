from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    features: Optional[str] = None
    specifications: Optional[str] = None
    image_url: Optional[str] = None
    gallery_images: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    order_position: int = 0


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    features: Optional[str] = None
    specifications: Optional[str] = None
    image_url: Optional[str] = None
    gallery_images: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    order_position: Optional[int] = None


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
