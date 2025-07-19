from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
import math
from decimal import Decimal

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.service import Service
from app.crud.service import service_crud
from app.schemas.service import ServiceCreate, ServiceUpdate
from app.utils.file_upload import save_uploaded_image, delete_image_file

router = APIRouter()


@router.get("/")
async def get_services(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    is_featured: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all services with filters and pagination"""
    # Get services with filters
    services = service_crud.get_multi_with_filters(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        category=category,
        is_active=is_active,
        is_featured=is_featured
    )
    
    # Get total count
    total = service_crud.get_count_with_filters(
        db=db,
        search=search,
        category=category,
        is_active=is_active,
        is_featured=is_featured
    )
    
    return {
        "services": services,
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "pages": math.ceil(total / limit) if total > 0 else 0
    }


@router.get("/featured")
async def get_featured_services(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get featured services"""
    services = service_crud.get_featured(db=db, limit=limit)
    return services


@router.get("/{service_id}")
async def get_service(
    service_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific service"""
    service = service_crud.get(db=db, id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.post("/")
async def create_service(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    short_description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    duration: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    features: Optional[str] = Form(None),
    requirements: Optional[str] = Form(None),
    is_featured: bool = Form(False),
    is_active: bool = Form(True),
    order_position: int = Form(0),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new service"""
    # Check permissions
    if getattr(current_user, 'is_superuser', False) is False and getattr(current_user, 'role', '') != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Create a dictionary for service data
    service_dict = {
        "name": name,
        "description": description,
        "short_description": short_description,
        "price": Decimal(price) if price is not None else None,
        "duration": duration,
        "category": category,
        "features": features,
        "requirements": requirements,
        "is_featured": is_featured,
        "icon": None,
        "order_position": order_position,
        "is_active": is_active
    }
    
    # Handle image upload first
    if image:
        image_path = await save_uploaded_image(image, subfolder="services")
        service_dict["image_url"] = image_path
    
    # Convert dictionary to ServiceCreate object
    service_data = ServiceCreate(**service_dict)
    
    # Create service
    db_service = service_crud.create(db=db, obj_in=service_data)
    
    # Return the service
    return db_service


@router.post("/with-image")
async def create_service_with_image(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    short_description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    duration: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    features: Optional[str] = Form(None),
    requirements: Optional[str] = Form(None),
    is_featured: bool = Form(False),
    is_active: bool = Form(True),
    order_position: int = Form(0),
    image: UploadFile = File(...),  # Required image
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new service with required image upload (admin only)"""
    # Check permissions
    if getattr(current_user, 'is_superuser', False) is False and getattr(current_user, 'role', '') != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Upload image (required)
    image_path = await save_uploaded_image(image, subfolder="services")
    
    # Create a dictionary for service data
    service_dict = {
        "name": name,
        "description": description,
        "short_description": short_description,
        "price": Decimal(price) if price is not None else None,
        "duration": duration,
        "category": category,
        "features": features,
        "requirements": requirements,
        "is_featured": is_featured,
        "icon": None,
        "order_position": order_position,
        "is_active": is_active,
        "image_url": image_path  # Add uploaded image
    }
    
    # Convert dictionary to ServiceCreate object
    service_data = ServiceCreate(**service_dict)
    
    # Create service
    db_service = service_crud.create(db=db, obj_in=service_data)
    
    # Return the service
    return db_service
    
    return service


@router.put("/{service_id}")
async def update_service(
    service_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    short_description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    duration: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    features: Optional[str] = Form(None),
    requirements: Optional[str] = Form(None),
    is_featured: Optional[bool] = Form(None),
    is_active: Optional[bool] = Form(None),
    order_position: Optional[int] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a service"""
    # Check permissions
    if not getattr(current_user, 'is_superuser', False) and getattr(current_user, 'role', '') != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Get existing service
    service = service_crud.get(db=db, id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Update service data
    update_data = {}
    for key, value in {
        "name": name,
        "description": description,
        "short_description": short_description,
        "price": Decimal(price) if price is not None else None,
        "duration": duration,
        "category": category,
        "features": features,
        "requirements": requirements,
        "is_featured": is_featured,
        "is_active": is_active,
        "order_position": order_position
    }.items():
        if value is not None:
            update_data[key] = value
    
    # Handle image upload
    if image:
        # Delete old image if exists
        image_url = getattr(service, 'image_url', None)
        if image_url:
            delete_image_file(image_url)
        
        # Upload new image
        image_path = await save_uploaded_image(image, subfolder="services")
        update_data["image_url"] = image_path
    
    # Create ServiceUpdate object
    service_update = ServiceUpdate(**{k: v for k, v in update_data.items() 
                                   if k in ServiceUpdate.__annotations__})
    
    # Update service
    updated_service = service_crud.update(db=db, db_obj=service, obj_in=service_update)
    
    return updated_service


@router.delete("/{service_id}")
async def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a service"""
    # Check permissions
    if not getattr(current_user, 'is_superuser', False) and getattr(current_user, 'role', '') != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Get existing service
    service = service_crud.get(db=db, id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Delete image if exists
    image_url = getattr(service, 'image_url', None)
    if image_url:
        delete_image_file(image_url)
    
    # Delete service (use remove method from the base class)
    service_crud.remove(db=db, id=service_id)
    
    return {"message": "Service deleted successfully"}


@router.put("/{service_id}/image")
async def update_service_image(
    service_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update service image only (admin only)"""
    # Check permissions
    if not getattr(current_user, 'is_superuser', False) and getattr(current_user, 'role', '') != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Get existing service
    service = service_crud.get(db=db, id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Delete old image if exists
    image_url = getattr(service, 'image_url', None)
    if image_url:
        delete_image_file(image_url)
    
    # Upload new image
    image_path = await save_uploaded_image(image, subfolder="services")
    
    # Update service with new image URL
    updated_service = service_crud.update_image(db=db, service_id=service_id, image_url=image_path)
    
    return updated_service


@router.delete("/{service_id}/image")
async def delete_service_image(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete service image only (admin only)"""
    # Check permissions
    if not getattr(current_user, 'is_superuser', False) and getattr(current_user, 'role', '') != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Get existing service
    service = service_crud.get(db=db, id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Delete image if exists
    image_url = getattr(service, 'image_url', None)
    if image_url:
        delete_image_file(image_url)
    
    # Update service to remove image URL
    updated_service = service_crud.update_image(db=db, service_id=service_id, image_url=None)
    
    return {"message": "Service image deleted successfully"}
