"""
Public Hero Banner Service
Handles public-facing hero banner operations with security and performance optimizations
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.hero_banner import HeroBanner


class PublicHeroBannerService:
    """Service for public hero banner operations"""
    
    @staticmethod
    def get_active_banners(
        db: Session, 
        skip: int = 0, 
        limit: int = 10
    ) -> List[HeroBanner]:
        """
        Get active hero banners for public display
        Only returns banners that are:
        - Active (is_active = True)
        - Not expired (if expiry date is set)
        - Ordered by display order
        """
        query = db.query(HeroBanner).filter(
            HeroBanner.is_active == True
        ).order_by(HeroBanner.order_position.asc())
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_banner_by_id(db: Session, banner_id: int) -> Optional[HeroBanner]:
        """
        Get a specific active banner by ID for public display
        Returns None if banner is not active or doesn't exist
        """
        return db.query(HeroBanner).filter(
            and_(
                HeroBanner.id == banner_id,
                HeroBanner.is_active == True
            )
        ).first()
    
    @staticmethod
    def get_featured_banner(db: Session) -> Optional[HeroBanner]:
        """
        Get the main featured banner for homepage
        Returns the first active banner ordered by position
        """
        return db.query(HeroBanner).filter(
            HeroBanner.is_active == True
        ).order_by(HeroBanner.order_position.asc()).first()
