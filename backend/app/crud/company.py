from typing import List, Optional, Union
from sqlalchemy.orm import Session
from pydantic import HttpUrl
from app.crud.base import CRUDBase
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate


class CRUDCompany(CRUDBase[Company, CompanyCreate, CompanyUpdate]):
    def _convert_pydantic_types(self, data: dict) -> dict:
        """Convert Pydantic types to Python primitives for database storage"""
        converted_data = {}
        for field, value in data.items():
            if isinstance(value, HttpUrl):
                converted_data[field] = str(value)
            elif hasattr(value, '__str__') and str(type(value)).startswith("<class 'pydantic"):
                # Handle other Pydantic types like EmailStr
                converted_data[field] = str(value)
            else:
                converted_data[field] = value
        return converted_data

    def get_company_info(self, db: Session) -> Optional[Company]:
        """Get the single company info record (assumes only one company)"""
        return db.query(Company).first()
    
    def create_or_update_company(
        self, db: Session, *, obj_in: CompanyCreate
    ) -> Company:
        """Create company info if none exists, otherwise update the existing one"""
        existing_company = self.get_company_info(db)
        if existing_company:
            # Update existing company
            update_data = self._convert_pydantic_types(obj_in.dict(exclude_unset=True))
            for field, value in update_data.items():
                setattr(existing_company, field, value)
            db.commit()
            db.refresh(existing_company)
            return existing_company
        else:
            # Create new company
            return self.create(db, obj_in=obj_in)
    
    def update(
        self, db: Session, *, db_obj: Company, obj_in: Union[CompanyUpdate, dict]
    ) -> Company:
        """Override update method to handle Pydantic types"""
        if isinstance(obj_in, dict):
            update_data = self._convert_pydantic_types(obj_in)
        else:
            update_data = self._convert_pydantic_types(obj_in.dict(exclude_unset=True))
        
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


company = CRUDCompany(Company)
