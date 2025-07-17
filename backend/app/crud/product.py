from typing import Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class CRUDProduct(CRUDBase[Product, ProductCreate, ProductUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> Optional[Product]:
        return db.query(Product).filter(Product.name == name).first()
    
    def get_featured(self, db: Session) -> list[Product]:
        return db.query(Product).filter(Product.is_featured == True, Product.is_active == True).all()
    
    def get_by_category(self, db: Session, *, category: str) -> list[Product]:
        return db.query(Product).filter(Product.category == category, Product.is_active == True).all()


product = CRUDProduct(Product)
