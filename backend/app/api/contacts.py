from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import contact
from app.schemas.contact import (
    Contact as ContactSchema,
    ContactCreate,
    ContactUpdate,
    ContactReply,
    ContactListResponse,
    ContactFilters,
    ContactStats
)
from app.models.contact import Contact as ContactModel
from app.models.user import User
from datetime import datetime
import math

router = APIRouter()


@router.get("/", response_model=ContactListResponse)
def get_contacts(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = Query(0, ge=0, description="Number of contacts to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of contacts to return"),
    search: str = Query(None, description="Search term for name, email, company, subject or message"),
    is_read: bool = Query(None, description="Filter by read status"),
    is_replied: bool = Query(None, description="Filter by reply status"),
    company: str = Query(None, description="Filter by company name"),
    start_date: datetime = Query(None, description="Filter contacts from this date"),
    end_date: datetime = Query(None, description="Filter contacts until this date"),
    order_by: str = Query("created_at", description="Field to order by"),
    order_desc: bool = Query(True, description="Order in descending order")
) -> Any:
    """
    Retrieve contacts with filtering and pagination.
    """
    filters = ContactFilters(
        skip=skip,
        limit=limit,
        search=search,
        is_read=is_read,
        is_replied=is_replied,
        company=company,
        start_date=start_date,
        end_date=end_date,
        order_by=order_by,
        order_desc=order_desc
    )
    
    items, total = contact.get_contacts(db, filters=filters)
    
    pages = math.ceil(total / limit) if total > 0 else 0
    page = (skip // limit) + 1 if limit > 0 else 1
    
    # Convert SQLAlchemy models to dict for Pydantic
    items_dict = [ContactSchema.from_orm(item) for item in items]
    
    return ContactListResponse(
        items=items_dict,
        total=total,
        page=page,
        size=len(items),
        pages=pages
    )


@router.post("/", response_model=ContactSchema)
def create_contact(
    *,
    db: Session = Depends(deps.get_db),
    contact_in: ContactCreate,
) -> Any:
    """
    Create new contact.
    """
    return contact.create(db=db, obj_in=contact_in)


@router.get("/stats", response_model=ContactStats)
def get_contact_stats(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get contact statistics.
    """
    return contact.get_stats(db)


@router.get("/unread", response_model=List[ContactSchema])
def get_unread_contacts(
    db: Session = Depends(deps.get_db),
    limit: int = Query(default=10, le=100),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve unread contacts.
    """
    return contact.get_unread_contacts(db, limit=limit)


@router.get("/pending-replies", response_model=List[ContactSchema])
def get_pending_replies(
    db: Session = Depends(deps.get_db),
    limit: int = Query(default=10, le=100),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve contacts pending replies.
    """
    return contact.get_pending_replies(db, limit=limit)


@router.get("/search", response_model=List[ContactSchema])
def search_contacts(
    q: str = Query(..., min_length=1),
    db: Session = Depends(deps.get_db),
    limit: int = Query(default=20, le=100),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Search contacts by name, email, company, or subject.
    """
    return contact.search_contacts(db, query=q, limit=limit)


@router.get("/recent", response_model=List[ContactSchema])
def get_recent_contacts(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    days: int = Query(7, ge=1, le=365, description="Number of days to look back")
) -> Any:
    """
    Get contacts from the last N days.
    """
    return contact.get_recent_contacts(db, days=days)


@router.get("/by-company/{company_name}", response_model=List[ContactSchema])
def get_contacts_by_company(
    *,
    company_name: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all contacts from a specific company.
    """
    return contact.get_by_company(db, company_name=company_name)


@router.get("/{contact_id}", response_model=ContactSchema)
def get_contact(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    contact_id: int,
) -> Any:
    """
    Get contact by ID.
    """
    contact_obj = contact.get(db=db, id=contact_id)
    if not contact_obj:
        raise HTTPException(
            status_code=404, detail="Contact not found"
        )
    return contact_obj


@router.put("/{contact_id}", response_model=ContactSchema)
def update_contact(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    contact_id: int,
    contact_in: ContactUpdate,
) -> Any:
    """
    Update a contact.
    """
    contact_obj = contact.get(db=db, id=contact_id)
    if not contact_obj:
        raise HTTPException(
            status_code=404, detail="Contact not found"
        )
    contact_obj = contact.update(db=db, db_obj=contact_obj, obj_in=contact_in)
    return contact_obj


@router.delete("/{contact_id}")
def delete_contact(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    contact_id: int,
) -> Any:
    """
    Delete a contact.
    """
    contact_obj = contact.get(db=db, id=contact_id)
    if not contact_obj:
        raise HTTPException(
            status_code=404, detail="Contact not found"
        )
    contact.remove(db=db, id=contact_id)
    return {"message": "Contact deleted successfully"}


@router.patch("/{contact_id}/mark-read", response_model=ContactSchema)
def mark_contact_as_read(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    contact_id: int,
) -> Any:
    """
    Mark a contact as read.
    """
    contact_obj = contact.mark_as_read(db=db, contact_id=contact_id)
    if not contact_obj:
        raise HTTPException(
            status_code=404, detail="Contact not found"
        )
    return contact_obj


@router.patch("/{contact_id}/mark-unread", response_model=ContactSchema)
def mark_contact_as_unread(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    contact_id: int,
) -> Any:
    """
    Mark a contact as unread.
    """
    contact_obj = contact.mark_as_unread(db=db, contact_id=contact_id)
    if not contact_obj:
        raise HTTPException(
            status_code=404, detail="Contact not found"
        )
    return contact_obj


@router.post("/{contact_id}/reply", response_model=ContactSchema)
def reply_to_contact(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    contact_id: int,
    reply: ContactReply,
) -> Any:
    """
    Reply to a contact.
    """
    contact_obj = contact.reply_to_contact(
        db=db, 
        contact_id=contact_id, 
        reply_message=reply.reply_message
    )
    if not contact_obj:
        raise HTTPException(
            status_code=404, detail="Contact not found"
        )
    return contact_obj


@router.post("/bulk/mark-read")
def bulk_mark_as_read(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    contact_ids: List[int],
) -> Any:
    """
    Mark multiple contacts as read.
    """
    updated_count = contact.bulk_mark_as_read(db=db, contact_ids=contact_ids)
    return {"message": f"Marked {updated_count} contacts as read"}


@router.delete("/bulk/delete")
def bulk_delete_contacts(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    contact_ids: List[int],
) -> Any:
    """
    Delete multiple contacts.
    """
    deleted_count = contact.bulk_delete(db=db, contact_ids=contact_ids)
    return {"message": f"Deleted {deleted_count} contacts"}
