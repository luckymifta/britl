from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, DECIMAL
from sqlalchemy.sql import func
from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    short_description = Column(Text)
    price = Column(DECIMAL(10, 2))
    category = Column(String(100))
    features = Column(Text)  # JSON string
    specifications = Column(Text)  # JSON string
    image_url = Column(String(500))
    gallery_images = Column(Text)  # JSON string of image URLs
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    order_position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
