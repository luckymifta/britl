from sqlalchemy.orm import Session
from typing import List, Optional
from app.crud.base import CRUDBase
from app.models.service_blog import ServiceFeature, ServiceMerchant, ServiceGallery, ServiceContent
from app.schemas.service_blog import (
    ServiceFeatureCreate, ServiceFeatureUpdate,
    ServiceMerchantCreate, ServiceMerchantUpdate,
    ServiceGalleryCreate, ServiceGalleryUpdate,
    ServiceContentCreate, ServiceContentUpdate
)


class CRUDServiceFeature(CRUDBase[ServiceFeature, ServiceFeatureCreate, ServiceFeatureUpdate]):
    def get_by_service(self, db: Session, *, service_id: int) -> List[ServiceFeature]:
        """Get all features for a service"""
        return db.query(ServiceFeature).filter(
            ServiceFeature.service_id == service_id,
            ServiceFeature.is_active == True
        ).order_by(ServiceFeature.order_position).all()

    def get_with_merchants(self, db: Session, *, feature_id: int) -> Optional[ServiceFeature]:
        """Get feature with its merchants"""
        return db.query(ServiceFeature).filter(ServiceFeature.id == feature_id).first()


class CRUDServiceMerchant(CRUDBase[ServiceMerchant, ServiceMerchantCreate, ServiceMerchantUpdate]):
    def get_by_feature(self, db: Session, *, feature_id: int) -> List[ServiceMerchant]:
        """Get all merchants for a feature"""
        return db.query(ServiceMerchant).filter(
            ServiceMerchant.feature_id == feature_id,
            ServiceMerchant.is_active == True
        ).order_by(ServiceMerchant.order_position).all()


class CRUDServiceGallery(CRUDBase[ServiceGallery, ServiceGalleryCreate, ServiceGalleryUpdate]):
    def get_by_service(self, db: Session, *, service_id: int) -> List[ServiceGallery]:
        """Get all gallery images for a service"""
        return db.query(ServiceGallery).filter(
            ServiceGallery.service_id == service_id,
            ServiceGallery.is_active == True
        ).order_by(ServiceGallery.order_position).all()


class CRUDServiceContent(CRUDBase[ServiceContent, ServiceContentCreate, ServiceContentUpdate]):
    def get_by_service(self, db: Session, *, service_id: int) -> List[ServiceContent]:
        """Get all content sections for a service"""
        return db.query(ServiceContent).filter(
            ServiceContent.service_id == service_id,
            ServiceContent.is_active == True
        ).order_by(ServiceContent.order_position).all()


# Create instances
service_feature_crud = CRUDServiceFeature(ServiceFeature)
service_merchant_crud = CRUDServiceMerchant(ServiceMerchant)
service_gallery_crud = CRUDServiceGallery(ServiceGallery)
service_content_crud = CRUDServiceContent(ServiceContent)
