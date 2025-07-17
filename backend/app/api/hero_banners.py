from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.hero_banner import HeroBanner
from app.schemas.hero_banner import (
    HeroBannerCreate, 
    HeroBannerUpdate, 
    HeroBannerResponse,
    BannerReorderRequest
)
from app.crud.hero_banner import hero_banner_crud
from app.utils.file_upload import save_uploaded_image, delete_image_file, get_image_url

router = APIRouter()


@router.get("/", response_model=List[HeroBannerResponse])
def get_hero_banners(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all hero banners (public endpoint)"""
    if active_only:
        banners = hero_banner_crud.get_active_banners(db)
    else:
        banners = hero_banner_crud.get_multi(db, skip=skip, limit=limit)
    return banners


@router.get("/featured", response_model=HeroBannerResponse)
def get_featured_banner(db: Session = Depends(get_db)):
    """Get the featured hero banner (public endpoint)"""
    banner = hero_banner_crud.get_featured_banner(db)
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No featured banner found"
        )
    return banner


@router.get("/{banner_id}", response_model=HeroBannerResponse)
def get_hero_banner(
    banner_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific hero banner by ID (public endpoint)"""
    banner = hero_banner_crud.get(db=db, id=banner_id)
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hero banner not found"
        )
    return banner


@router.post("/", response_model=HeroBannerResponse)
def create_hero_banner(
    banner_data: HeroBannerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new hero banner (admin only)"""
    banner = hero_banner_crud.create(db=db, obj_in=banner_data)
    return banner


@router.post("/with-image", response_model=HeroBannerResponse)
async def create_hero_banner_with_image(
    title: str = Form(...),
    subtitle: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    button_text: Optional[str] = Form(None),
    button_link: Optional[str] = Form(None),
    is_active: bool = Form(True),
    order_position: int = Form(0),
    background_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new hero banner with background image upload (admin only)"""
    background_image_url = None
    if background_image:
        # Upload and save background image
        image_path = await save_uploaded_image(background_image, "hero-banners")
        background_image_url = get_image_url(image_path)
    
    # Create banner data
    banner_data = HeroBannerCreate(
        title=title,
        subtitle=subtitle,
        description=description,
        button_text=button_text,
        button_link=button_link,
        image_url=background_image_url,
        is_active=is_active,
        order_position=order_position
    )
    
    banner = hero_banner_crud.create(db=db, obj_in=banner_data)
    return banner


@router.put("/{banner_id}", response_model=HeroBannerResponse)
def update_hero_banner(
    banner_id: int,
    banner_data: HeroBannerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a hero banner (admin only)"""
    banner = hero_banner_crud.get(db=db, id=banner_id)
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hero banner not found"
        )
    banner = hero_banner_crud.update(db=db, db_obj=banner, obj_in=banner_data)
    return banner


@router.put("/{banner_id}/image", response_model=HeroBannerResponse)
async def update_banner_image(
    banner_id: int,
    background_image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update hero banner background image (admin only)"""
    banner = hero_banner_crud.get(db=db, id=banner_id)
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hero banner not found"
        )
    
    # Delete old background image if exists
    old_image_url = getattr(banner, 'image_url', None)
    if old_image_url:
        old_image_path = old_image_url.replace("/static/", "")
        delete_image_file(old_image_path)
    
    # Upload new background image
    image_path = await save_uploaded_image(background_image, "hero-banners")
    image_url = get_image_url(image_path)
    
    # Update banner with new background image URL
    update_data = {"image_url": image_url}
    banner = hero_banner_crud.update(db=db, db_obj=banner, obj_in=update_data)
    return banner


@router.delete("/{banner_id}/image")
async def delete_banner_image(
    banner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete hero banner background image (admin only)"""
    banner = hero_banner_crud.get(db=db, id=banner_id)
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hero banner not found"
        )
    
    # Delete image file if exists
    current_image_url = getattr(banner, 'image_url', None)
    if current_image_url:
        image_path = current_image_url.replace("/static/", "")
        delete_image_file(image_path)
        
        # Remove image URL from database
        update_data = {"image_url": None}
        hero_banner_crud.update(db=db, db_obj=banner, obj_in=update_data)
        
        return {"message": "Banner background image deleted successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No background image found for this banner"
        )


@router.post("/reorder", response_model=List[HeroBannerResponse])
def reorder_banners(
    reorder_data: BannerReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Reorder hero banners (admin only)"""
    updated_banners = hero_banner_crud.reorder_banners(db, reorder_data.banner_ids)
    return updated_banners


@router.delete("/{banner_id}")
def delete_hero_banner(
    banner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a hero banner (admin only)"""
    banner = hero_banner_crud.get(db=db, id=banner_id)
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hero banner not found"
        )
    
    # Delete background image file if exists
    current_image_url = getattr(banner, 'image_url', None)
    if current_image_url:
        image_path = current_image_url.replace("/static/", "")
        delete_image_file(image_path)
    
    hero_banner_crud.remove(db=db, id=banner_id)
    return {"message": "Hero banner deleted successfully"}
