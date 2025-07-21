"""
Public Service Service
Handles public-facing service operations
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from app.models.service import Service


class PublicServiceService:
    """Service for public service operations"""
    
    @staticmethod
    def get_published_services(
        db: Session, 
        skip: int = 0, 
        limit: int = 20
    ) -> List[Service]:
        """
        Get published services for public display
        Only returns services that are:
        - Active (is_active = True)
        - Ordered by position and creation date
        """
        return db.query(Service).filter(
            Service.is_active == True
        ).order_by(
            desc(Service.order_position), 
            desc(Service.created_at)
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_service_by_id(db: Session, service_id: int) -> Optional[Service]:
        """
        Get a specific active service by ID for public display
        Returns None if service is not active or doesn't exist
        """
        return db.query(Service).filter(
            and_(
                Service.id == service_id,
                Service.is_active == True
            )
        ).first()
    
    @staticmethod
    def get_services_by_category(
        db: Session,
        category: str,
        skip: int = 0,
        limit: int = 20
    ) -> List[Service]:
        """
        Get active services by category for public display
        """
        return db.query(Service).filter(
            and_(
                Service.category == category,
                Service.is_active == True
            )
        ).order_by(
            desc(Service.order_position), 
            desc(Service.created_at)
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_featured_services(
        db: Session,
        limit: int = 6
    ) -> List[Service]:
        """
        Get featured services for public display
        Only returns active and featured services
        """
        return db.query(Service).filter(
            and_(
                Service.is_active == True,
                Service.is_featured == True
            )
        ).order_by(
            desc(Service.order_position), 
            desc(Service.created_at)
        ).limit(limit).all()
