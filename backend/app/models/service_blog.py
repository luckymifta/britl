from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ServiceFeature(Base):
    """Detailed features for a service (e.g., Top Up, Pulsa for BRIZZI)"""
    __tablename__ = "service_features"
    
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)  # e.g., "Top Up"
    description = Column(Text)  # Rich description
    icon_url = Column(String(500))  # Feature icon
    order_position = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    service = relationship("Service", back_populates="detailed_features")
    merchants = relationship("ServiceMerchant", back_populates="feature", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ServiceFeature(id={self.id}, name='{self.name}', service_id={self.service_id})>"


class ServiceMerchant(Base):
    """Merchants/partners for a specific service feature"""
    __tablename__ = "service_merchants"
    
    id = Column(Integer, primary_key=True, index=True)
    feature_id = Column(Integer, ForeignKey("service_features.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)  # e.g., "Indomaret"
    logo_url = Column(String(500))
    description = Column(Text)
    website_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    order_position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    feature = relationship("ServiceFeature", back_populates="merchants")

    def __repr__(self):
        return f"<ServiceMerchant(id={self.id}, name='{self.name}', feature_id={self.feature_id})>"


class ServiceGallery(Base):
    """Gallery images for a service"""
    __tablename__ = "service_gallery"
    
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"))
    image_url = Column(String(500), nullable=False)
    caption = Column(String(500))
    alt_text = Column(String(255))
    order_position = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    service = relationship("Service", back_populates="gallery_images")

    def __repr__(self):
        return f"<ServiceGallery(id={self.id}, service_id={self.service_id})>"


class ServiceContent(Base):
    """Blog-style content sections for a service"""
    __tablename__ = "service_content"
    
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"))
    section_title = Column(String(255))  # e.g., "How it Works", "Benefits"
    content = Column(Text)  # Rich HTML content
    content_type = Column(String(50), default="html")  # html, markdown, plain_text
    order_position = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    service = relationship("Service", back_populates="content_sections")

    def __repr__(self):
        return f"<ServiceContent(id={self.id}, section_title='{self.section_title}', service_id={self.service_id})>"
