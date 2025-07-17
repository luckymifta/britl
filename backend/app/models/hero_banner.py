from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class HeroBanner(Base):
    __tablename__ = "hero_banners"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    subtitle = Column(Text)
    description = Column(Text)
    image_url = Column(String(500))
    button_text = Column(String(100))
    button_link = Column(String(500))
    is_active = Column(Boolean, default=True)
    order_position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
