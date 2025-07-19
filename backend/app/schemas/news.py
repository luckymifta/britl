from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import re


class NewsBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="News title")
    excerpt: Optional[str] = Field(None, description="Brief news excerpt")
    content: str = Field(..., min_length=1, description="News content")
    author: Optional[str] = Field(None, max_length=255, description="Author name")
    category: Optional[str] = Field(None, max_length=100, description="News category")
    tags: Optional[str] = Field(None, description="Tags (JSON string)")
    featured_image_url: Optional[str] = Field(None, max_length=500, description="Featured image URL")
    attachments: Optional[str] = Field(None, description="File attachments (JSON string)")
    is_published: Optional[bool] = Field(False, description="Is published")
    is_featured: Optional[bool] = Field(False, description="Is featured news")
    published_at: Optional[datetime] = Field(None, description="Publication date")

    @validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()

    @validator('content')
    def validate_content(cls, v):
        if not v or not v.strip():
            raise ValueError('Content cannot be empty')
        return v.strip()

    @validator('category')
    def validate_category(cls, v):
        if v:
            allowed_categories = [
                'announcement', 'news', 'update', 'press-release', 
                'company-news', 'industry-news', 'event', 'promotion'
            ]
            if v.lower() not in allowed_categories:
                raise ValueError(f'Category must be one of: {", ".join(allowed_categories)}')
        return v


class NewsCreate(NewsBase):
    slug: Optional[str] = Field(None, max_length=255, description="URL slug (auto-generated if not provided)")

    @validator('slug', pre=True, always=True)
    def generate_slug(cls, v, values):
        if not v and 'title' in values:
            # Generate slug from title
            slug = re.sub(r'[^\w\s-]', '', values['title']).strip()
            slug = re.sub(r'[-\s]+', '-', slug).lower()
            return slug
        return v


class NewsUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    excerpt: Optional[str] = None
    content: Optional[str] = Field(None, min_length=1)
    author: Optional[str] = Field(None, max_length=255)
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[str] = None
    featured_image_url: Optional[str] = Field(None, max_length=500)
    attachments: Optional[str] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    published_at: Optional[datetime] = None

    @validator('title')
    def validate_title(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Title cannot be empty')
        return v.strip() if v else v

    @validator('content')
    def validate_content(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Content cannot be empty')
        return v.strip() if v else v

    @validator('category')
    def validate_category(cls, v):
        if v:
            allowed_categories = [
                'announcement', 'news', 'update', 'press-release', 
                'company-news', 'industry-news', 'event', 'promotion'
            ]
            if v.lower() not in allowed_categories:
                raise ValueError(f'Category must be one of: {", ".join(allowed_categories)}')
        return v


class NewsImageUpdate(BaseModel):
    featured_image_url: str = Field(..., max_length=500, description="Featured image URL")


class NewsResponse(NewsBase):
    id: int
    slug: str
    views_count: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class NewsListResponse(BaseModel):
    items: List[NewsResponse]
    total: int
    page: int
    size: int
    pages: int


class NewsStatsResponse(BaseModel):
    total_news: int
    published_news: int
    featured_news: int
    draft_news: int
    categories: List[dict]
    recent_views: int


# Announcement schemas (extending news with announcement-specific fields)
class AnnouncementBase(NewsBase):
    priority: Optional[str] = Field("normal", description="Announcement priority: low, normal, high, urgent")
    expires_at: Optional[datetime] = Field(None, description="Announcement expiration date")
    is_sticky: Optional[bool] = Field(False, description="Pin announcement to top")

    @validator('priority')
    def validate_priority(cls, v):
        if v:
            allowed_priorities = ['low', 'normal', 'high', 'urgent']
            if v.lower() not in allowed_priorities:
                raise ValueError(f'Priority must be one of: {", ".join(allowed_priorities)}')
        return v.lower() if v else 'normal'


class AnnouncementCreate(AnnouncementBase):
    slug: Optional[str] = Field(None, max_length=255, description="URL slug (auto-generated if not provided)")

    @validator('slug', pre=True, always=True)
    def generate_slug(cls, v, values):
        if not v and 'title' in values:
            # Generate slug from title
            slug = re.sub(r'[^\w\s-]', '', values['title']).strip()
            slug = re.sub(r'[-\s]+', '-', slug).lower()
            return slug
        return v


class AnnouncementUpdate(NewsUpdate):
    priority: Optional[str] = Field(None, description="Announcement priority")
    expires_at: Optional[datetime] = None
    is_sticky: Optional[bool] = None

    @validator('priority')
    def validate_priority(cls, v):
        if v:
            allowed_priorities = ['low', 'normal', 'high', 'urgent']
            if v.lower() not in allowed_priorities:
                raise ValueError(f'Priority must be one of: {", ".join(allowed_priorities)}')
        return v.lower() if v else v


class AnnouncementResponse(NewsResponse):
    priority: str
    expires_at: Optional[datetime]
    is_sticky: bool
    is_expired: bool = Field(description="Computed field for expiration status")


class AnnouncementListResponse(BaseModel):
    items: List[AnnouncementResponse]
    total: int
    page: int
    size: int
    pages: int
