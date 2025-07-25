from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ServiceFeature Schemas
class ServiceFeatureBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Feature name")
    description: Optional[str] = Field(None, description="Feature description")
    icon_url: Optional[str] = Field(None, max_length=500, description="Feature icon URL")
    order_position: Optional[int] = Field(0, description="Display order")
    is_active: Optional[bool] = Field(True, description="Feature is active")


class ServiceFeatureCreate(ServiceFeatureBase):
    service_id: int = Field(..., description="Service ID")


class ServiceFeatureUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    icon_url: Optional[str] = Field(None, max_length=500)
    order_position: Optional[int] = None
    is_active: Optional[bool] = None


# ServiceMerchant Schemas
class ServiceMerchantBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Merchant name")
    logo_url: Optional[str] = Field(None, max_length=500, description="Merchant logo URL")
    description: Optional[str] = Field(None, description="Merchant description")
    website_url: Optional[str] = Field(None, max_length=500, description="Merchant website")
    order_position: Optional[int] = Field(0, description="Display order")
    is_active: Optional[bool] = Field(True, description="Merchant is active")


class ServiceMerchantCreate(ServiceMerchantBase):
    feature_id: int = Field(..., description="Feature ID")


class ServiceMerchantUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    logo_url: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    website_url: Optional[str] = Field(None, max_length=500)
    order_position: Optional[int] = None
    is_active: Optional[bool] = None


# ServiceGallery Schemas
class ServiceGalleryBase(BaseModel):
    image_url: str = Field(..., max_length=500, description="Gallery image URL")
    caption: Optional[str] = Field(None, description="Image caption")
    alt_text: Optional[str] = Field(None, description="Image alt text")
    order_position: Optional[int] = Field(0, description="Display order")
    is_active: Optional[bool] = Field(True, description="Image is active")


class ServiceGalleryCreate(ServiceGalleryBase):
    service_id: int = Field(..., description="Service ID")


class ServiceGalleryUpdate(BaseModel):
    image_url: Optional[str] = Field(None, max_length=500)
    caption: Optional[str] = None
    alt_text: Optional[str] = None
    order_position: Optional[int] = None
    is_active: Optional[bool] = None


# ServiceContent Schemas
class ServiceContentBase(BaseModel):
    section_title: Optional[str] = Field(None, max_length=255, description="Section title")
    content: str = Field(..., description="Section content")
    content_type: str = Field("html", description="Content type (html, markdown, text)")
    order_position: Optional[int] = Field(0, description="Display order")
    is_active: Optional[bool] = Field(True, description="Content is active")


class ServiceContentCreate(ServiceContentBase):
    service_id: int = Field(..., description="Service ID")


class ServiceContentUpdate(BaseModel):
    section_title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    content_type: Optional[str] = None
    order_position: Optional[int] = None
    is_active: Optional[bool] = None


# Response Schemas
class ServiceFeatureResponse(ServiceFeatureBase):
    id: int
    service_id: int
    created_at: datetime
    updated_at: datetime
    merchants: List["ServiceMerchantResponse"] = []

    class Config:
        from_attributes = True


class ServiceMerchantResponse(ServiceMerchantBase):
    id: int
    feature_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ServiceGalleryResponse(ServiceGalleryBase):
    id: int
    service_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ServiceContentResponse(ServiceContentBase):
    id: int
    service_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Combined Service Blog Response
class ServiceBlogResponse(BaseModel):
    # Base service fields
    id: int
    name: str
    slug: str
    description: str
    long_description: Optional[str] = None
    meta_description: Optional[str] = None
    keywords: Optional[str] = None
    image_url: Optional[str] = None
    icon_url: Optional[str] = None
    category_id: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    # Blog content
    detailed_features: List[ServiceFeatureResponse] = []
    gallery_images: List[ServiceGalleryResponse] = []
    content_sections: List[ServiceContentResponse] = []

    class Config:
        from_attributes = True


# Update forward references
ServiceFeatureResponse.model_rebuild()
