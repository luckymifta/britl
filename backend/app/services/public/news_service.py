"""
Public News Service
Handles public-facing news and announcement operations
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, or_
from datetime import datetime, timezone
from app.models.news import News


class PublicNewsService:
    """Service for public news operations"""
    
    @staticmethod
    def get_published_news(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        category: Optional[str] = None
    ) -> List[News]:
        """
        Get published news for public display
        Only returns news that are:
        - Published (is_published = True)
        - Published date is in the past
        - Optionally filtered by category
        """
        query = db.query(News).filter(
            and_(
                News.is_published == True,
                News.category != 'announcement'  # Exclude announcements from regular news
            )
        )
        
        if category:
            query = query.filter(News.category == category)
            
        return query.order_by(desc(News.published_at)).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_news_by_id(db: Session, news_id: int) -> Optional[News]:
        """
        Get a specific published news article by ID
        Returns None if news is not published or doesn't exist
        """
        return db.query(News).filter(
            and_(
                News.id == news_id,
                News.is_published == True,
                News.category != 'announcement'
            )
        ).first()
    
    @staticmethod
    def get_latest_news(
        db: Session,
        limit: int = 5
    ) -> List[News]:
        """
        Get latest published news for homepage
        """
        return db.query(News).filter(
            and_(
                News.is_published == True,
                News.category != 'announcement'
            )
        ).order_by(desc(News.published_at)).limit(limit).all()
    
    @staticmethod
    def get_featured_news(
        db: Session,
        limit: int = 3
    ) -> List[News]:
        """
        Get featured news for homepage
        """
        return db.query(News).filter(
            and_(
                News.is_published == True,
                News.is_featured == True,
                News.category != 'announcement'
            )
        ).order_by(desc(News.created_at)).limit(limit).all()
    
    @staticmethod
    def get_announcements(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        include_expired: bool = False
    ) -> List[News]:
        """
        Get published announcements for public display
        """
        query = db.query(News).filter(
            and_(
                News.is_published == True,
                News.category == 'announcement'
            )
        )
        
        if not include_expired:
            current_time = datetime.now(timezone.utc)
            query = query.filter(
                or_(
                    News.expires_at.is_(None),
                    News.expires_at > current_time
                )
            )
        
        return query.order_by(
            desc(News.is_sticky),
            desc(News.published_at)
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_announcement_by_id(db: Session, announcement_id: int) -> Optional[News]:
        """
        Get a specific published announcement by ID
        Returns None if announcement is not published or doesn't exist
        """
        return db.query(News).filter(
            and_(
                News.id == announcement_id,
                News.is_published == True,
                News.category == 'announcement'
            )
        ).first()
    
    @staticmethod
    def search_content(
        db: Session,
        query: str,
        content_type: str = "news",
        limit: int = 10
    ) -> List[News]:
        """
        Search published news content
        """
        search_term = f"%{query}%"
        
        db_query = db.query(News).filter(
            and_(
                News.is_published == True,
                or_(
                    News.title.ilike(search_term),
                    News.excerpt.ilike(search_term),
                    News.content.ilike(search_term)
                )
            )
        )
        
        if content_type == "announcements":
            db_query = db_query.filter(News.category == 'announcement')
        elif content_type == "news":
            db_query = db_query.filter(News.category != 'announcement')
        
        return db_query.order_by(desc(News.published_at)).limit(limit).all()
