from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import os
import uuid
import json
from pathlib import Path

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.news import News
from app.schemas.news import (
    NewsCreate, NewsUpdate, NewsResponse, NewsListResponse, NewsStatsResponse,
    AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse, AnnouncementListResponse,
    NewsImageUpdate
)
from app.crud.news import news
from app.utils.file_upload import save_uploaded_image, delete_image_file
from app.utils.document_upload import save_uploaded_document, delete_document_file, get_document_url
import json

router = APIRouter()

# Directory for news images and documents
UPLOAD_DIR = "uploads/news"
DOCUMENTS_DIR = "uploads/news/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DOCUMENTS_DIR, exist_ok=True)


@router.get("/", response_model=NewsListResponse)
def get_news_list(
    *,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of items to return"),
    search: Optional[str] = Query(None, description="Search term"),
    category: Optional[str] = Query(None, description="Filter by category"),
    author: Optional[str] = Query(None, description="Filter by author"),
    is_published: Optional[bool] = Query(None, description="Filter by published status"),
    is_featured: Optional[bool] = Query(None, description="Filter by featured status"),
    order_by: str = Query("created_at", description="Field to order by"),
    order_desc: bool = Query(True, description="Order in descending order"),
    current_user: User = Depends(get_current_user)
):
    """
    Get news list with filters and pagination
    """
    news_items = news.get_multi_with_filters(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        category=category,
        author=author,
        is_published=is_published,
        is_featured=is_featured,
        order_by=order_by,
        order_desc=order_desc
    )
    
    total = news.count_with_filters(
        db=db,
        search=search,
        category=category,
        author=author,
        is_published=is_published,
        is_featured=is_featured
    )
    
    # Add computed fields for announcements
    response_items = []
    for item in news_items:
        item_dict = item.__dict__.copy()
        if getattr(item, 'category', '') == 'announcement':
            # Add is_expired field for announcements
            if getattr(item, 'expires_at', None):
                item_dict['is_expired'] = datetime.now(timezone.utc) > getattr(item, 'expires_at')
            else:
                item_dict['is_expired'] = False
        response_items.append(item_dict)
    
    return NewsListResponse(
        items=response_items,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )


@router.get("/stats", response_model=NewsStatsResponse)
def get_news_stats(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get news statistics
    """
    stats = news.get_stats(db=db)
    return NewsStatsResponse(**stats)


@router.get("/featured", response_model=List[NewsResponse])
def get_featured_news(
    *,
    db: Session = Depends(get_db),
    limit: int = Query(5, ge=1, le=20, description="Number of featured items to return")
):
    """
    Get featured news (public endpoint)
    """
    featured_news = news.get_featured(db=db, limit=limit)
    return featured_news


@router.get("/latest", response_model=List[NewsResponse])
def get_latest_news(
    *,
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=50, description="Number of latest items to return"),
    category: Optional[str] = Query(None, description="Filter by category")
):
    """
    Get latest published news (public endpoint)
    """
    latest_news = news.get_latest(db=db, limit=limit, category=category)
    return latest_news


@router.get("/announcements", response_model=AnnouncementListResponse)
def get_announcements(
    *,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of items to return"),
    include_expired: bool = Query(False, description="Include expired announcements"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    current_user: User = Depends(get_current_user)
):
    """
    Get announcements with special filtering and ordering
    """
    announcements = news.get_announcements(
        db=db,
        skip=skip,
        limit=limit,
        include_expired=include_expired,
        priority=priority
    )
    
    total = news.count_with_filters(
        db=db,
        category="announcement",
        priority=priority,
        include_expired=include_expired
    )
    
    # Add computed is_expired field
    response_items = []
    for item in announcements:
        item_dict = item.__dict__.copy()
        if getattr(item, 'expires_at', None):
            item_dict['is_expired'] = datetime.now(timezone.utc) > getattr(item, 'expires_at')
        else:
            item_dict['is_expired'] = False
        response_items.append(item_dict)
    
    return AnnouncementListResponse(
        items=response_items,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )


@router.get("/{news_id}", response_model=NewsResponse)
def get_news_by_id(
    *,
    db: Session = Depends(get_db),
    news_id: int,
    increment_views: bool = Query(False, description="Increment view count"),
    current_user: User = Depends(get_current_user)
):
    """
    Get news by ID
    """
    db_news = news.get(db=db, id=news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    if increment_views:
        db_news = news.increment_views(db=db, news_id=news_id)
    
    return db_news


@router.get("/slug/{slug}", response_model=NewsResponse)
def get_news_by_slug(
    *,
    db: Session = Depends(get_db),
    slug: str,
    increment_views: bool = Query(True, description="Increment view count")
):
    """
    Get news by slug (public endpoint)
    """
    db_news = news.get_by_slug(db=db, slug=slug)
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    # Only increment views for published news
    if increment_views and getattr(db_news, 'is_published', False):
        db_news = news.increment_views(db=db, news_id=getattr(db_news, 'id'))
    
    return db_news


@router.post("/", response_model=NewsResponse)
def create_news(
    *,
    db: Session = Depends(get_db),
    news_in: NewsCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create new news
    """
    # Set author if not provided
    if not news_in.author:
        news_in.author = getattr(current_user, 'full_name', '') or getattr(current_user, 'email', '')
    
    db_news = news.create_with_slug_check(db=db, obj_in=news_in)
    return db_news


@router.post("/announcements", response_model=AnnouncementResponse)
def create_announcement(
    *,
    db: Session = Depends(get_db),
    announcement_in: AnnouncementCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create new announcement
    """
    # Force category to announcement
    announcement_in.category = "announcement"
    
    # Set author if not provided
    if not announcement_in.author:
        announcement_in.author = getattr(current_user, 'full_name', '') or getattr(current_user, 'email', '')
    
    db_announcement = news.create_with_slug_check(db=db, obj_in=announcement_in)
    
    # Add computed is_expired field
    response_dict = db_announcement.__dict__.copy()
    if getattr(db_announcement, 'expires_at', None):
        response_dict['is_expired'] = datetime.now(timezone.utc) > getattr(db_announcement, 'expires_at')
    else:
        response_dict['is_expired'] = False
    
    return response_dict


@router.put("/{news_id}", response_model=NewsResponse)
def update_news(
    *,
    db: Session = Depends(get_db),
    news_id: int,
    news_in: NewsUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update news
    """
    db_news = news.get(db=db, id=news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    db_news = news.update(db=db, db_obj=db_news, obj_in=news_in)
    return db_news


@router.put("/announcements/{news_id}", response_model=AnnouncementResponse)
def update_announcement(
    *,
    db: Session = Depends(get_db),
    news_id: int,
    announcement_in: AnnouncementUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update announcement
    """
    db_announcement = news.get(db=db, id=news_id)
    if not db_announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    if getattr(db_announcement, 'category', '') != "announcement":
        raise HTTPException(status_code=400, detail="Item is not an announcement")
    
    db_announcement = news.update(db=db, db_obj=db_announcement, obj_in=announcement_in)
    
    # Add computed is_expired field
    response_dict = db_announcement.__dict__.copy()
    if getattr(db_announcement, 'expires_at', None):
        response_dict['is_expired'] = datetime.now(timezone.utc) > getattr(db_announcement, 'expires_at')
    else:
        response_dict['is_expired'] = False
    
    return response_dict


@router.delete("/{news_id}")
def delete_news(
    *,
    db: Session = Depends(get_db),
    news_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Delete news
    """
    db_news = news.get(db=db, id=news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    # Delete associated image file if exists
    if getattr(db_news, 'featured_image_url', None):
        delete_image_file(getattr(db_news, 'featured_image_url'))
    
    # Delete associated document attachments if exist
    current_attachments = getattr(db_news, 'attachments', None)
    if current_attachments:
        try:
            attachments_list = json.loads(current_attachments)
            for attachment in attachments_list:
                delete_document_file(attachment.get("file_path", ""))
        except:
            pass  # If JSON parsing fails, continue with deletion
    
    news.remove(db=db, id=news_id)
    return {"message": "News deleted successfully"}


@router.post("/{news_id}/upload-image", response_model=NewsResponse)
async def upload_news_image(
    *,
    db: Session = Depends(get_db),
    news_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload image for news
    """
    db_news = news.get(db=db, id=news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not allowed. Allowed types: {', '.join(allowed_types)}"
        )
    
    # Save the file
    try:
        file_url = await save_uploaded_image(file, "news")
        
        # Delete old image if exists
        if getattr(db_news, 'featured_image_url', None):
            delete_image_file(getattr(db_news, 'featured_image_url'))
        
        # Update news with new image URL
        image_update = NewsImageUpdate(featured_image_url=file_url)
        db_news = news.update_image(db=db, db_obj=db_news, obj_in=image_update)
        
        return db_news
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")


@router.post("/{news_id}/upload-document", response_model=dict)
async def upload_news_document(
    *,
    db: Session = Depends(get_db),
    news_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload document attachment for news
    """
    db_news = news.get(db=db, id=news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    # Save the document
    try:
        file_info = await save_uploaded_document(file, "news/documents")
        
        # Get current attachments
        current_attachments = getattr(db_news, 'attachments', None)
        attachments_list = []
        if current_attachments:
            try:
                attachments_list = json.loads(current_attachments)
            except:
                attachments_list = []
        
        # Add new attachment
        new_attachment = {
            "id": str(uuid.uuid4()),
            "original_filename": file_info["filename"],
            "saved_filename": file_info["saved_filename"],
            "file_path": file_info["file_path"],
            "file_size": file_info["file_size"],
            "file_type": file_info["file_type"],
            "file_extension": file_info["file_extension"],
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "download_url": get_document_url(file_info["file_path"])
        }
        
        attachments_list.append(new_attachment)
        
        # Update news with new attachments
        setattr(db_news, 'attachments', json.dumps(attachments_list))
        db.commit()
        db.refresh(db_news)
        
        return {
            "message": "Document uploaded successfully",
            "attachment": new_attachment,
            "total_attachments": len(attachments_list)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")


@router.get("/{news_id}/attachments", response_model=List[dict])
def get_news_attachments(
    *,
    db: Session = Depends(get_db),
    news_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Get all attachments for a news article
    """
    db_news = news.get(db=db, id=news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    current_attachments = getattr(db_news, 'attachments', None)
    if not current_attachments:
        return []
    
    try:
        attachments_list = json.loads(current_attachments)
        return attachments_list
    except:
        return []


@router.delete("/{news_id}/attachments/{attachment_id}")
def delete_news_attachment(
    *,
    db: Session = Depends(get_db),
    news_id: int,
    attachment_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a specific attachment from news
    """
    db_news = news.get(db=db, id=news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    current_attachments = getattr(db_news, 'attachments', None)
    if not current_attachments:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    try:
        attachments_list = json.loads(current_attachments)
        
        # Find and remove the attachment
        attachment_to_delete = None
        updated_attachments = []
        
        for attachment in attachments_list:
            if attachment.get("id") == attachment_id:
                attachment_to_delete = attachment
            else:
                updated_attachments.append(attachment)
        
        if not attachment_to_delete:
            raise HTTPException(status_code=404, detail="Attachment not found")
        
        # Delete the physical file
        delete_document_file(attachment_to_delete.get("file_path", ""))
        
        # Update the database
        setattr(db_news, 'attachments', json.dumps(updated_attachments))
        db.commit()
        db.refresh(db_news)
        
        return {
            "message": "Attachment deleted successfully",
            "deleted_attachment": attachment_to_delete["original_filename"],
            "remaining_attachments": len(updated_attachments)
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid attachments data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete attachment: {str(e)}")


@router.post("/{news_id}/upload-multiple-documents", response_model=dict)
async def upload_multiple_news_documents(
    *,
    db: Session = Depends(get_db),
    news_id: int,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload multiple document attachments for news
    """
    db_news = news.get(db=db, id=news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    if len(files) > 10:  # Limit to 10 files at once
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed per upload")
    
    # Get current attachments
    current_attachments = getattr(db_news, 'attachments', None)
    attachments_list = []
    if current_attachments:
        try:
            attachments_list = json.loads(current_attachments)
        except:
            attachments_list = []
    
    uploaded_files = []
    failed_files = []
    
    for file in files:
        try:
            file_info = await save_uploaded_document(file, "news/documents")
            
            new_attachment = {
                "id": str(uuid.uuid4()),
                "original_filename": file_info["filename"],
                "saved_filename": file_info["saved_filename"],
                "file_path": file_info["file_path"],
                "file_size": file_info["file_size"],
                "file_type": file_info["file_type"],
                "file_extension": file_info["file_extension"],
                "uploaded_at": datetime.now(timezone.utc).isoformat(),
                "download_url": get_document_url(file_info["file_path"])
            }
            
            attachments_list.append(new_attachment)
            uploaded_files.append(new_attachment)
            
        except Exception as e:
            failed_files.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    # Update news with new attachments
    setattr(db_news, 'attachments', json.dumps(attachments_list))
    db.commit()
    db.refresh(db_news)
    
    return {
        "message": f"Uploaded {len(uploaded_files)} files successfully",
        "uploaded_files": uploaded_files,
        "failed_files": failed_files,
        "total_attachments": len(attachments_list)
    }


@router.patch("/{news_id}/publish", response_model=NewsResponse)
def publish_news(
    *,
    db: Session = Depends(get_db),
    news_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Publish news
    """
    db_news = news.publish(db=db, news_id=news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    return db_news


@router.patch("/{news_id}/unpublish", response_model=NewsResponse)
def unpublish_news(
    *,
    db: Session = Depends(get_db),
    news_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Unpublish news
    """
    db_news = news.unpublish(db=db, news_id=news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    return db_news


@router.patch("/{news_id}/toggle-featured", response_model=NewsResponse)
def toggle_featured_news(
    *,
    db: Session = Depends(get_db),
    news_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Toggle featured status of news
    """
    db_news = news.toggle_featured(db=db, news_id=news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    return db_news


@router.patch("/{news_id}/toggle-sticky", response_model=NewsResponse)
def toggle_sticky_announcement(
    *,
    db: Session = Depends(get_db),
    news_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Toggle sticky status of announcement
    """
    db_news = news.toggle_sticky(db=db, news_id=news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    if getattr(db_news, 'category', '') != "announcement":
        raise HTTPException(status_code=400, detail="Only announcements can be made sticky")
    
    return db_news
