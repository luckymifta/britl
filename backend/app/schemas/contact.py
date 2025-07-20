from typing import Optional, List, Union
from datetime import datetime
from pydantic import BaseModel, EmailStr


class ContactBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    subject: str
    message: str


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    subject: Optional[str] = None
    message: Optional[str] = None
    is_read: Optional[bool] = None
    is_replied: Optional[bool] = None
    reply_message: Optional[str] = None


class ContactReply(BaseModel):
    reply_message: str


class Contact(ContactBase):
    id: int
    is_read: bool
    is_replied: bool
    reply_message: Optional[str] = None
    replied_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContactInDB(Contact):
    pass


class ContactResponse(Contact):
    pass


class ContactListResponse(BaseModel):
    items: List[Contact]
    total: int
    page: int
    size: int
    pages: int
    
    class Config:
        from_attributes = True


class ContactFilters(BaseModel):
    skip: Optional[int] = 0
    limit: Optional[int] = 50
    search: Optional[str] = None
    is_read: Optional[bool] = None
    is_replied: Optional[bool] = None
    company: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    order_by: Optional[str] = "created_at"
    order_desc: Optional[bool] = True


class ContactStats(BaseModel):
    total_contacts: int
    unread_contacts: int
    read_contacts: int
    replied_contacts: int
    pending_contacts: int  # not replied
    today_contacts: int
    this_week_contacts: int
    this_month_contacts: int
