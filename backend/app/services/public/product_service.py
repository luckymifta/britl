"""
Public Product Service
Handles public-facing product operations
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from app.models.product import Product


class PublicProductService:
    """Service for public product operations"""
    
    @staticmethod
    def get_active_products(
        db: Session, 
        skip: int = 0, 
        limit: int = 20
    ) -> List[Product]:
        """
        Get active products for public display
        Only returns products that are:
        - Active (is_active = True)
        - Ordered by creation date (newest first)
        """
        return db.query(Product).filter(
            Product.is_active == True
        ).order_by(desc(Product.created_at)).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
        """
        Get a specific active product by ID for public display
        Returns None if product is not active or doesn't exist
        """
        return db.query(Product).filter(
            and_(
                Product.id == product_id,
                Product.is_active == True
            )
        ).first()
    
    @staticmethod
    def get_products_by_category(
        db: Session,
        category: str,
        skip: int = 0,
        limit: int = 20
    ) -> List[Product]:
        """
        Get active products by category for public display
        """
        return db.query(Product).filter(
            and_(
                Product.category == category,
                Product.is_active == True
            )
        ).order_by(desc(Product.created_at)).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_featured_products(
        db: Session,
        limit: int = 6
    ) -> List[Product]:
        """
        Get featured products for public display
        Only returns active and featured products
        """
        return db.query(Product).filter(
            and_(
                Product.is_active == True,
                Product.is_featured == True
            )
        ).order_by(desc(Product.created_at)).limit(limit).all()
