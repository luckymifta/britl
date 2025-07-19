from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class ServiceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Service name")
    description: Optional[str] = Field(None, description="Detailed service description")
    short_description: Optional[str] = Field(None, description="Brief service description")
    price: Optional[Decimal] = Field(None, description="Service price")
    duration: Optional[str] = Field(None, max_length=100, description="Service duration")
    category: Optional[str] = Field(None, max_length=100, description="Service category")
    features: Optional[str] = Field(None, description="Service features (JSON string)")
    requirements: Optional[str] = Field(None, description="Service requirements")
    image_url: Optional[str] = Field(None, max_length=500, description="Service image URL")
    icon: Optional[str] = Field(None, max_length=100, description="Icon class name or URL")
    is_featured: Optional[bool] = Field(False, description="Featured service")
    is_active: Optional[bool] = Field(True, description="Service is active")
    order_position: Optional[int] = Field(0, description="Display order position")


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[Decimal] = None
    duration: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None, max_length=100)
    features: Optional[str] = None
    requirements: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    icon: Optional[str] = Field(None, max_length=100)
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    order_position: Optional[int] = None


class ServiceImageUpdate(BaseModel):
    image_url: Optional[str] = None


class ServiceStatusUpdate(BaseModel):
    is_active: bool


class ServiceResponse(ServiceBase):
    id: int
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            Decimal: lambda v: float(v) if v is not None else None
        }


class ServiceListResponse(BaseModel):
    id: int
    name: str
    short_description: Optional[str] = None
    price: Optional[Decimal] = None
    duration: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = None
    is_featured: bool = False
    is_active: Optional[bool] = True
    order_position: int = 0
    created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            Decimal: lambda v: float(v) if v is not None else None
        }


class ServicesListResponse(BaseModel):
    services: List[ServiceListResponse]
    total: int
    page: int
    size: int
    pages: int


class ServiceStatsResponse(BaseModel):
    total_services: int
    active_services: int
    inactive_services: int
    featured_services: int
    services_by_category: dict


class ServiceSearchFilters(BaseModel):
    search: Optional[str] = None
    category: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
