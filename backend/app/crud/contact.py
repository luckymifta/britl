from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, and_, or_, func, case
from app.crud.base import CRUDBase
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactUpdate, ContactFilters, ContactStats


class CRUDContact(CRUDBase[Contact, ContactCreate, ContactUpdate]):
    def get_contacts(
        self,
        db: Session,
        *,
        filters: ContactFilters
    ) -> tuple[List[Contact], int]:
        """Get contacts with filtering, pagination and search"""
        query = db.query(self.model)
        
        # Apply filters
        filter_conditions = []
        
        if filters.search:
            search_term = f"%{filters.search}%"
            filter_conditions.append(
                or_(
                    self.model.name.ilike(search_term),
                    self.model.email.ilike(search_term),
                    self.model.company.ilike(search_term),
                    self.model.subject.ilike(search_term),
                    self.model.message.ilike(search_term)
                )
            )
        
        if filters.is_read is not None:
            filter_conditions.append(self.model.is_read == filters.is_read)
            
        if filters.is_replied is not None:
            filter_conditions.append(self.model.is_replied == filters.is_replied)
            
        if filters.company:
            filter_conditions.append(self.model.company.ilike(f"%{filters.company}%"))
            
        if filters.start_date:
            filter_conditions.append(self.model.created_at >= filters.start_date)
            
        if filters.end_date:
            filter_conditions.append(self.model.created_at <= filters.end_date)
        
        if filter_conditions:
            query = query.filter(and_(*filter_conditions))
        
        # Get total count before pagination
        total = query.count()
        
        # Apply ordering
        if filters.order_by:
            order_column = getattr(self.model, filters.order_by, None)
            if order_column:
                if filters.order_desc:
                    query = query.order_by(desc(order_column))
                else:
                    query = query.order_by(asc(order_column))
        else:
            # Default ordering by created_at desc
            query = query.order_by(desc(self.model.created_at))
        
        # Apply pagination
        items = query.offset(filters.skip).limit(filters.limit).all()
        
        return items, total

    def mark_as_read(self, db: Session, *, contact_id: int) -> Optional[Contact]:
        """Mark a contact as read"""
        contact = self.get(db, id=contact_id)
        if contact:
            setattr(contact, 'is_read', True)
            setattr(contact, 'updated_at', datetime.utcnow())
            db.add(contact)
            db.commit()
            db.refresh(contact)
        return contact

    def mark_as_unread(self, db: Session, *, contact_id: int) -> Optional[Contact]:
        """Mark a contact as unread"""
        contact = self.get(db, id=contact_id)
        if contact:
            setattr(contact, 'is_read', False)
            setattr(contact, 'updated_at', datetime.utcnow())
            db.add(contact)
            db.commit()
            db.refresh(contact)
        return contact

    def reply_to_contact(
        self, 
        db: Session, 
        *, 
        contact_id: int, 
        reply_message: str
    ) -> Optional[Contact]:
        """Reply to a contact"""
        contact = self.get(db, id=contact_id)
        if contact:
            setattr(contact, 'reply_message', reply_message)
            setattr(contact, 'is_replied', True)
            setattr(contact, 'replied_at', datetime.utcnow())
            setattr(contact, 'is_read', True)  # Automatically mark as read when replying
            setattr(contact, 'updated_at', datetime.utcnow())
            db.add(contact)
            db.commit()
            db.refresh(contact)
        return contact

    def get_unread_contacts(self, db: Session, limit: int = 10) -> List[Contact]:
        """Get latest unread contacts"""
        return (
            db.query(self.model)
            .filter(self.model.is_read == False)
            .order_by(desc(self.model.created_at))
            .limit(limit)
            .all()
        )

    def get_pending_replies(self, db: Session, limit: int = 10) -> List[Contact]:
        """Get contacts that haven't been replied to yet"""
        return (
            db.query(self.model)
            .filter(self.model.is_replied == False)
            .order_by(desc(self.model.created_at))
            .limit(limit)
            .all()
        )

    def get_contacts_by_company(self, db: Session, company: str) -> List[Contact]:
        """Get all contacts from a specific company"""
        return (
            db.query(self.model)
            .filter(self.model.company.ilike(f"%{company}%"))
            .order_by(desc(self.model.created_at))
            .all()
        )

    def get_stats(self, db: Session) -> ContactStats:
        """Get contact statistics"""
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=now.weekday())
        month_start = today_start.replace(day=1)
        
        # Get basic counts
        total_contacts = db.query(func.count(self.model.id)).scalar()
        unread_contacts = db.query(func.count(self.model.id)).filter(
            self.model.is_read == False
        ).scalar()
        read_contacts = db.query(func.count(self.model.id)).filter(
            self.model.is_read == True
        ).scalar()
        replied_contacts = db.query(func.count(self.model.id)).filter(
            self.model.is_replied == True
        ).scalar()
        pending_contacts = db.query(func.count(self.model.id)).filter(
            self.model.is_replied == False
        ).scalar()
        
        # Get time-based counts
        today_contacts = db.query(func.count(self.model.id)).filter(
            self.model.created_at >= today_start
        ).scalar()
        this_week_contacts = db.query(func.count(self.model.id)).filter(
            self.model.created_at >= week_start
        ).scalar()
        this_month_contacts = db.query(func.count(self.model.id)).filter(
            self.model.created_at >= month_start
        ).scalar()
        
        return ContactStats(
            total_contacts=total_contacts or 0,
            unread_contacts=unread_contacts or 0,
            read_contacts=read_contacts or 0,
            replied_contacts=replied_contacts or 0,
            pending_contacts=pending_contacts or 0,
            today_contacts=today_contacts or 0,
            this_week_contacts=this_week_contacts or 0,
            this_month_contacts=this_month_contacts or 0
        )

    def bulk_mark_as_read(self, db: Session, *, contact_ids: List[int]) -> int:
        """Mark multiple contacts as read"""
        updated_count = (
            db.query(self.model)
            .filter(self.model.id.in_(contact_ids))
            .update(
                {
                    self.model.is_read: True,
                    self.model.updated_at: datetime.utcnow()
                },
                synchronize_session=False
            )
        )
        db.commit()
        return updated_count

    def bulk_delete(self, db: Session, *, contact_ids: List[int]) -> int:
        """Delete multiple contacts"""
        deleted_count = (
            db.query(self.model)
            .filter(self.model.id.in_(contact_ids))
            .delete(synchronize_session=False)
        )
        db.commit()
        return deleted_count

    def search_contacts(
        self, 
        db: Session, 
        *, 
        query: str, 
        limit: int = 20
    ) -> List[Contact]:
        """Search contacts by name, email, company, or subject"""
        search_term = f"%{query}%"
        return (
            db.query(self.model)
            .filter(
                or_(
                    self.model.name.ilike(search_term),
                    self.model.email.ilike(search_term),
                    self.model.company.ilike(search_term),
                    self.model.subject.ilike(search_term)
                )
            )
            .order_by(desc(self.model.created_at))
            .limit(limit)
            .all()
        )

    def get_by_company(self, db: Session, *, company_name: str) -> List[Contact]:
        """Get all contacts from a specific company"""
        return (
            db.query(self.model)
            .filter(self.model.company.ilike(f"%{company_name}%"))
            .order_by(desc(self.model.created_at))
            .all()
        )

    def get_recent_contacts(self, db: Session, *, days: int = 7) -> List[Contact]:
        """Get contacts from the last N days"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        return (
            db.query(self.model)
            .filter(self.model.created_at >= cutoff_date)
            .order_by(desc(self.model.created_at))
            .all()
        )


contact = CRUDContact(Contact)
