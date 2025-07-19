from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, DECIMAL
from sqlalchemy.sql import func
from app.core.database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    short_description = Column(Text)
    price = Column(DECIMAL(10, 2))
    duration = Column(String(100))  # e.g., "1 hour", "1 day", "ongoing"
    category = Column(String(100))
    features = Column(Text)  # JSON string
    requirements = Column(Text)
    image_url = Column(String(500))
    icon = Column(String(100))  # Icon class name or URL
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    order_position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Service(id={self.id}, name='{self.name}', is_active={self.is_active})>"
