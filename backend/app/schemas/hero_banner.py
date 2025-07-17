from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class HeroBannerBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True
    order_position: int = 0


class HeroBannerCreate(HeroBannerBase):
    pass


class HeroBannerUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    order_position: Optional[int] = None


class HeroBannerResponse(HeroBannerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class HeroBanner(HeroBannerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BannerReorderRequest(BaseModel):
    """Schema for reordering banners"""
    banner_ids: list[int]
