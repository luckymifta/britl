from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    excerpt = Column(Text)
    content = Column(Text, nullable=False)
    author = Column(String(255))
    category = Column(String(100))
    tags = Column(Text)  # JSON string
    featured_image_url = Column(String(500))
    is_published = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    published_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
