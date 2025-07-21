from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.crud.base import CRUDBase
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class CRUDProduct(CRUDBase[Product, ProductCreate, ProductUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> Optional[Product]:
        return db.query(Product).filter(Product.name == name).first()
    
    def get_featured(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Product]:
        return db.query(Product).filter(
            Product.is_featured == True, 
            Product.is_active == True
        ).order_by(desc(Product.created_at)).offset(skip).limit(limit).all()
    
    def get_by_category(self, db: Session, *, category: str, skip: int = 0, limit: int = 100) -> List[Product]:
        return db.query(Product).filter(
            Product.category == category, 
            Product.is_active == True
        ).order_by(desc(Product.created_at)).offset(skip).limit(limit).all()
    
    def get_active_products(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Product]:
        """Get active products for public display"""
        return db.query(Product).filter(
            Product.is_active == True
        ).order_by(desc(Product.created_at)).offset(skip).limit(limit).all()


product = CRUDProduct(Product)
