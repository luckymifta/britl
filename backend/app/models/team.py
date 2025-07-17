from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    position = Column(String(255), nullable=False)
    bio = Column(Text)
    email = Column(String(255))
    phone = Column(String(50))
    linkedin_url = Column(String(500))
    twitter_url = Column(String(500))
    image_url = Column(String(500))
    department = Column(String(100))
    is_active = Column(Boolean, default=True)
    order_position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
