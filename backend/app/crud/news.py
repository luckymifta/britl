from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timezone
from app.models.news import News
from app.schemas.news import NewsCreate, NewsUpdate, NewsImageUpdate, AnnouncementCreate, AnnouncementUpdate
from app.crud.base import CRUDBase
import json


class NewsCRUD(CRUDBase[News, NewsCreate, NewsUpdate]):
    
    def get_multi_with_filters(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        category: Optional[str] = None,
        author: Optional[str] = None,
        is_published: Optional[bool] = None,
        is_featured: Optional[bool] = None,
        priority: Optional[str] = None,
        is_sticky: Optional[bool] = None,
        include_expired: bool = True,
        order_by: str = "created_at",
        order_desc: bool = True
    ) -> List[News]:
        """Get news with filters and search"""
        query = db.query(News)
        
        # Apply filters
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    News.title.ilike(search_term),
                    News.excerpt.ilike(search_term),
                    News.content.ilike(search_term),
                    News.author.ilike(search_term)
                )
            )
        
        if category:
            if category == "announcements":
                query = query.filter(News.category == "announcement")
            elif category == "news":
                query = query.filter(News.category != "announcement")
            else:
                query = query.filter(News.category == category)
        
        if author:
            query = query.filter(News.author.ilike(f"%{author}%"))
        
        if is_published is not None:
            query = query.filter(News.is_published == is_published)
        
        if is_featured is not None:
            query = query.filter(News.is_featured == is_featured)
        
        if priority:
            query = query.filter(News.priority == priority)
        
        if is_sticky is not None:
            query = query.filter(News.is_sticky == is_sticky)
        
        # Filter expired announcements
        if not include_expired:
            current_time = datetime.now(timezone.utc)
            query = query.filter(
                or_(
                    News.expires_at.is_(None),
                    News.expires_at > current_time
                )
            )
        
        # Apply ordering
        if hasattr(News, order_by):
            order_column = getattr(News, order_by)
            if order_desc:
                query = query.order_by(desc(order_column))
            else:
                query = query.order_by(asc(order_column))
        
        # Special ordering for announcements (sticky first)
        if category == "announcements" or category == "announcement":
            query = query.order_by(desc(News.is_sticky), desc(News.created_at))
        
        return query.offset(skip).limit(limit).all()

    def count_with_filters(
        self,
        db: Session,
        *,
        search: Optional[str] = None,
        category: Optional[str] = None,
        author: Optional[str] = None,
        is_published: Optional[bool] = None,
        is_featured: Optional[bool] = None,
        priority: Optional[str] = None,
        is_sticky: Optional[bool] = None,
        include_expired: bool = True
    ) -> int:
        """Count news with filters"""
        query = db.query(News)
        
        # Apply same filters as get_multi_with_filters
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    News.title.ilike(search_term),
                    News.excerpt.ilike(search_term),
                    News.content.ilike(search_term),
                    News.author.ilike(search_term)
                )
            )
        
        if category:
            if category == "announcements":
                query = query.filter(News.category == "announcement")
            elif category == "news":
                query = query.filter(News.category != "announcement")
            else:
                query = query.filter(News.category == category)
        
        if author:
            query = query.filter(News.author.ilike(f"%{author}%"))
        
        if is_published is not None:
            query = query.filter(News.is_published == is_published)
        
        if is_featured is not None:
            query = query.filter(News.is_featured == is_featured)
        
        if priority:
            query = query.filter(News.priority == priority)
        
        if is_sticky is not None:
            query = query.filter(News.is_sticky == is_sticky)
        
        if not include_expired:
            current_time = datetime.now(timezone.utc)
            query = query.filter(
                or_(
                    News.expires_at.is_(None),
                    News.expires_at > current_time
                )
            )
        
        return query.count()

    def get_by_slug(self, db: Session, *, slug: str) -> Optional[News]:
        """Get news by slug"""
        return db.query(News).filter(News.slug == slug).first()

    def increment_views(self, db: Session, *, news_id: int) -> Optional[News]:
        """Increment view count for news"""
        news = db.query(News).filter(News.id == news_id).first()
        if news:
            current_views = getattr(news, 'views_count', 0)
            setattr(news, 'views_count', current_views + 1)
            db.commit()
            db.refresh(news)
        return news

    def get_featured(self, db: Session, *, limit: int = 5) -> List[News]:
        """Get featured news"""
        return db.query(News).filter(
            and_(News.is_featured == True, News.is_published == True)
        ).order_by(desc(News.created_at)).limit(limit).all()

    def get_latest(self, db: Session, *, limit: int = 10, category: Optional[str] = None) -> List[News]:
        """Get latest published news"""
        query = db.query(News).filter(News.is_published == True)
        
        if category:
            if category == "announcements":
                query = query.filter(News.category == "announcement")
            elif category == "news":
                query = query.filter(News.category != "announcement")
            else:
                query = query.filter(News.category == category)
        
        return query.order_by(desc(News.published_at)).limit(limit).all()

    def get_announcements(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        include_expired: bool = False,
        priority: Optional[str] = None
    ) -> List[News]:
        """Get announcements with special filtering"""
        query = db.query(News).filter(News.category == "announcement")
        
        if not include_expired:
            current_time = datetime.now(timezone.utc)
            query = query.filter(
                or_(
                    News.expires_at.is_(None),
                    News.expires_at > current_time
                )
            )
        
        if priority:
            query = query.filter(News.priority == priority)
        
        # Order by sticky first, then priority, then date
        query = query.order_by(
            desc(News.is_sticky),
            func.case(
                (News.priority == "urgent", 4),
                (News.priority == "high", 3),
                (News.priority == "normal", 2),
                (News.priority == "low", 1),
                else_=0
            ).desc(),
            desc(News.created_at)
        )
        
        return query.offset(skip).limit(limit).all()

    def get_stats(self, db: Session) -> Dict[str, Any]:
        """Get news statistics"""
        total_news = db.query(News).count()
        published_news = db.query(News).filter(News.is_published == True).count()
        featured_news = db.query(News).filter(News.is_featured == True).count()
        draft_news = db.query(News).filter(News.is_published == False).count()
        
        # Category breakdown
        categories = db.query(
            News.category,
            func.count(News.id).label('count')
        ).group_by(News.category).all()
        
        # Recent views (last 30 days)
        thirty_days_ago = datetime.now(timezone.utc).replace(day=1)
        recent_views = db.query(func.sum(News.views_count)).filter(
            News.created_at >= thirty_days_ago
        ).scalar() or 0
        
        return {
            "total_news": total_news,
            "published_news": published_news,
            "featured_news": featured_news,
            "draft_news": draft_news,
            "categories": [{"name": cat, "count": count} for cat, count in categories],
            "recent_views": recent_views
        }

    def create_with_slug_check(self, db: Session, *, obj_in: Union[NewsCreate, AnnouncementCreate]) -> News:
        """Create news with unique slug generation"""
        base_slug = obj_in.slug
        slug = base_slug
        counter = 1
        
        # Ensure unique slug
        while db.query(News).filter(News.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Create the news object
        db_obj = News(
            title=obj_in.title,
            slug=slug,
            excerpt=obj_in.excerpt,
            content=obj_in.content,
            author=obj_in.author,
            category=obj_in.category,
            tags=obj_in.tags,
            featured_image_url=obj_in.featured_image_url,
            is_published=obj_in.is_published,
            is_featured=obj_in.is_featured,
            published_at=obj_in.published_at
        )
        
        # Set announcement-specific fields if creating announcement
        if hasattr(obj_in, 'priority'):
            setattr(db_obj, 'priority', getattr(obj_in, 'priority', 'normal'))
        if hasattr(obj_in, 'expires_at'):
            setattr(db_obj, 'expires_at', getattr(obj_in, 'expires_at', None))
        if hasattr(obj_in, 'is_sticky'):
            setattr(db_obj, 'is_sticky', getattr(obj_in, 'is_sticky', False))
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_image(self, db: Session, *, db_obj: News, obj_in: NewsImageUpdate) -> News:
        """Update news image"""
        setattr(db_obj, 'featured_image_url', obj_in.featured_image_url)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def publish(self, db: Session, *, news_id: int) -> Optional[News]:
        """Publish news"""
        news = db.query(News).filter(News.id == news_id).first()
        if news:
            setattr(news, 'is_published', True)
            setattr(news, 'published_at', datetime.now(timezone.utc))
            db.commit()
            db.refresh(news)
        return news

    def unpublish(self, db: Session, *, news_id: int) -> Optional[News]:
        """Unpublish news"""
        news = db.query(News).filter(News.id == news_id).first()
        if news:
            setattr(news, 'is_published', False)
            setattr(news, 'published_at', None)
            db.commit()
            db.refresh(news)
        return news

    def toggle_featured(self, db: Session, *, news_id: int) -> Optional[News]:
        """Toggle featured status"""
        news = db.query(News).filter(News.id == news_id).first()
        if news:
            current_featured = getattr(news, 'is_featured', False)
            setattr(news, 'is_featured', not current_featured)
            db.commit()
            db.refresh(news)
        return news

    def toggle_sticky(self, db: Session, *, news_id: int) -> Optional[News]:
        """Toggle sticky status for announcements"""
        news = db.query(News).filter(News.id == news_id).first()
        if news and getattr(news, 'category', '') == "announcement":
            current_sticky = getattr(news, 'is_sticky', False)
            setattr(news, 'is_sticky', not current_sticky)
            db.commit()
            db.refresh(news)
        return news


# Create instance
news = NewsCRUD(News)
