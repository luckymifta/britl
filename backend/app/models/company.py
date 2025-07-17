from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Company(Base):
    __tablename__ = "company_info"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    mission = Column(Text)
    vision = Column(Text)
    values = Column(Text)
    address = Column(Text)
    phone = Column(String(50))
    email = Column(String(255))
    website = Column(String(255))
    founded_year = Column(Integer)
    logo_url = Column(String(500))
    about_image_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
