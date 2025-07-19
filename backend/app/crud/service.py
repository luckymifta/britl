from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from typing import List, Optional, Dict, Any
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceImageUpdate
from app.crud.base import CRUDBase
import json


class ServiceCRUD(CRUDBase[Service, ServiceCreate, ServiceUpdate]):
    
    def get_multi_with_filters(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        category: Optional[str] = None,
        is_active: Optional[bool] = None,
        is_featured: Optional[bool] = None,
        order_by: str = "created_at",
        order_desc: bool = True
    ) -> List[Service]:
        """Get services with filters and search"""
        query = db.query(Service)
        
        # Apply filters
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Service.name.ilike(search_term),
                    Service.description.ilike(search_term),
                    Service.short_description.ilike(search_term)
                )
            )
        
        if category:
            query = query.filter(Service.category == category)
        
        if is_active is not None:
            query = query.filter(Service.is_active == is_active)
        
        if is_featured is not None:
            query = query.filter(Service.is_featured == is_featured)
        
        # Apply ordering
        if hasattr(Service, order_by):
            order_column = getattr(Service, order_by)
            if order_desc:
                query = query.order_by(desc(order_column))
            else:
                query = query.order_by(asc(order_column))
        
        return query.offset(skip).limit(limit).all()

    def get_count_with_filters(
        self,
        db: Session,
        *,
        search: Optional[str] = None,
        category: Optional[str] = None,
        is_active: Optional[bool] = None,
        is_featured: Optional[bool] = None
    ) -> int:
        """Get count of services with filters"""
        query = db.query(Service)
        
        # Apply same filters as get_multi_with_filters
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Service.name.ilike(search_term),
                    Service.description.ilike(search_term),
                    Service.short_description.ilike(search_term)
                )
            )
        
        if category:
            query = query.filter(Service.category == category)
        
        if is_active is not None:
            query = query.filter(Service.is_active == is_active)
        
        if is_featured is not None:
            query = query.filter(Service.is_featured == is_featured)
        
        return query.count()

    def update_image(
        self, db: Session, *, service_id: int, image_url: Optional[str]
    ) -> Optional[Service]:
        """Update service image"""
        service = self.get(db, id=service_id)
        if not service:
            return None
            
        setattr(service, 'image_url', image_url)
        db.commit()
        db.refresh(service)
        return service

    def update_status(
        self, db: Session, *, service_id: int, is_active: bool
    ) -> Optional[Service]:
        """Update service active status"""
        service = self.get(db, id=service_id)
        if not service:
            return None
            
        setattr(service, 'is_active', is_active)
        db.commit()
        db.refresh(service)
        return service

    def get_featured(self, db: Session, *, limit: int = 10) -> List[Service]:
        """Get featured services"""
        return db.query(Service).filter(
            and_(
                Service.is_featured == True,
                Service.is_active == True
            )
        ).order_by(desc(Service.order_position), desc(Service.created_at)).limit(limit).all()

    def get_by_category(
        self, db: Session, *, category: str, limit: int = 10
    ) -> List[Service]:
        """Get services by category"""
        return db.query(Service).filter(
            and_(
                Service.category == category,
                Service.is_active == True
            )
        ).order_by(desc(Service.order_position), desc(Service.created_at)).limit(limit).all()

    def get_published(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Service]:
        """Get published (active) services"""
        return db.query(Service).filter(
            Service.is_active == True
        ).order_by(desc(Service.order_position), desc(Service.created_at)).offset(skip).limit(limit).all()

    def get_stats(self, db: Session) -> Dict[str, Any]:
        """Get service statistics"""
        total_services = db.query(Service).count()
        active_services = db.query(Service).filter(Service.is_active == True).count()
        inactive_services = db.query(Service).filter(Service.is_active == False).count()
        featured_services = db.query(Service).filter(Service.is_featured == True).count()
        
        # Services by category
        category_stats = db.query(
            Service.category,
            func.count(Service.id).label('count')
        ).group_by(Service.category).all()
        
        services_by_category = {stat.category: stat.count for stat in category_stats if stat.category}
        
        return {
            "total_services": total_services,
            "active_services": active_services,
            "inactive_services": inactive_services,
            "featured_services": featured_services,
            "services_by_category": services_by_category
        }

    def search_services(
        self, db: Session, *, query: str, limit: int = 10
    ) -> List[Service]:
        """Search services by name, description"""
        search_term = f"%{query}%"
        return db.query(Service).filter(
            and_(
                Service.is_active == True,
                or_(
                    Service.name.ilike(search_term),
                    Service.description.ilike(search_term),
                    Service.short_description.ilike(search_term)
                )
            )
        ).limit(limit).all()

    def get_related_services(
        self, db: Session, *, service_id: int, limit: int = 5
    ) -> List[Service]:
        """Get related services based on category"""
        service = self.get(db, id=service_id)
        if not service:
            return []
            
        service_category = getattr(service, 'category', None)
        if not service_category:
            return []
            
        return db.query(Service).filter(
            and_(
                Service.id != service_id,
                Service.category == service_category,
                Service.is_active == True
            )
        ).order_by(desc(Service.order_position)).limit(limit).all()


service_crud = ServiceCRUD(Service)
