from typing import Optional, List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.hero_banner import HeroBanner
from app.schemas.hero_banner import HeroBannerCreate, HeroBannerUpdate


class CRUDHeroBanner(CRUDBase[HeroBanner, HeroBannerCreate, HeroBannerUpdate]):
    def get_active_banners(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[HeroBanner]:
        """Get all active hero banners ordered by position"""
        return db.query(HeroBanner).filter(
            HeroBanner.is_active == True
        ).order_by(HeroBanner.order_position).offset(skip).limit(limit).all()
    
    def get_by_title(self, db: Session, *, title: str) -> Optional[HeroBanner]:
        """Get hero banner by title"""
        return db.query(HeroBanner).filter(HeroBanner.title == title).first()
    
    def get_featured_banner(self, db: Session) -> Optional[HeroBanner]:
        """Get the first active banner (featured)"""
        return db.query(HeroBanner).filter(
            HeroBanner.is_active == True
        ).order_by(HeroBanner.order_position).first()
    
    def reorder_banners(self, db: Session, banner_ids: List[int]) -> List[HeroBanner]:
        """Reorder banners by updating their positions"""
        updated_banners = []
        for position, banner_id in enumerate(banner_ids, 1):
            banner = self.get(db=db, id=banner_id)
            if banner:
                banner = self.update(
                    db=db, 
                    db_obj=banner, 
                    obj_in={"order_position": position}
                )
                updated_banners.append(banner)
        return updated_banners


hero_banner_crud = CRUDHeroBanner(HeroBanner)
