from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.service import Service
from app.crud.service import service_crud
from app.crud.service_blog import (
    service_feature_crud, service_merchant_crud, 
    service_gallery_crud, service_content_crud
)
from app.schemas.service_blog import (
    ServiceFeatureCreate, ServiceFeatureUpdate, ServiceFeatureResponse,
    ServiceMerchantCreate, ServiceMerchantUpdate, ServiceMerchantResponse,
    ServiceGalleryCreate, ServiceGalleryUpdate, ServiceGalleryResponse,
    ServiceContentCreate, ServiceContentUpdate, ServiceContentResponse,
    ServiceBlogResponse
)
from app.utils.file_upload import save_uploaded_image, delete_image_file

router = APIRouter()


# Service Blog Content Endpoints
@router.get("/{service_id}/blog", response_model=ServiceBlogResponse)
async def get_service_blog_content(
    service_id: int,
    db: Session = Depends(get_db)
):
    """Get full blog-style content for a service"""
    service = service_crud.get(db=db, id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get all related content
    features = service_feature_crud.get_by_service(db=db, service_id=service_id)
    gallery = service_gallery_crud.get_by_service(db=db, service_id=service_id)
    content_sections = service_content_crud.get_by_service(db=db, service_id=service_id)
    
    # Convert to response models
    feature_responses = []
    for feature in features:
        merchants = service_merchant_crud.get_by_feature(db=db, feature_id=feature.id)  # type: ignore
        merchant_responses = [ServiceMerchantResponse.from_orm(merchant) for merchant in merchants]
        feature_response = ServiceFeatureResponse.from_orm(feature)
        feature_response.merchants = merchant_responses
        feature_responses.append(feature_response)
    
    gallery_responses = [ServiceGalleryResponse.from_orm(item) for item in gallery]
    content_responses = [ServiceContentResponse.from_orm(section) for section in content_sections]
    
    return ServiceBlogResponse(
        **service.__dict__,
        detailed_features=feature_responses,
        gallery_images=gallery_responses,
        content_sections=content_responses
    )


# Service Features Endpoints
@router.post("/{service_id}/features", response_model=ServiceFeatureResponse)
async def create_service_feature(
    service_id: int,
    name: str = Form(...),
    description: Optional[str] = Form(None),
    order_position: int = Form(0),
    icon: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a feature to a service (e.g., Top Up, Pulsa)"""
    # Check permissions
    if not getattr(current_user, 'is_superuser', False) and getattr(current_user, 'role', '') != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Verify service exists
    service = service_crud.get(db=db, id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Handle icon upload
    icon_url = None
    if icon:
        icon_url = await save_uploaded_image(icon, subfolder="service_features")
    
    # Create feature
    feature_data = ServiceFeatureCreate(
        service_id=service_id,
        name=name,
        description=description,
        icon_url=icon_url,
        order_position=order_position,
        is_active=True
    )
    
    feature = service_feature_crud.create(db=db, obj_in=feature_data)
    feature.merchants = []  # Initialize empty merchants list
    return feature


@router.get("/{service_id}/features", response_model=List[ServiceFeatureResponse])
async def get_service_features(
    service_id: int,
    db: Session = Depends(get_db)
):
    """Get all features for a service"""
    features = service_feature_crud.get_by_service(db=db, service_id=service_id)
    
    # Load merchants for each feature
    for feature in features:
        feature.merchants = service_merchant_crud.get_by_feature(db=db, feature_id=feature.id)  # type: ignore
    
    return features


@router.put("/features/{feature_id}", response_model=ServiceFeatureResponse)
async def update_service_feature(
    feature_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    order_position: Optional[int] = Form(None),
    is_active: Optional[bool] = Form(None),
    icon: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a service feature"""
    # Check permissions
    if not getattr(current_user, 'is_superuser', False) and getattr(current_user, 'role', '') != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Get existing feature
    feature = service_feature_crud.get(db=db, id=feature_id)
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    
    # Update data
    update_data = {}
    if name is not None:
        update_data["name"] = name
    if description is not None:
        update_data["description"] = description
    if order_position is not None:
        update_data["order_position"] = order_position
    if is_active is not None:
        update_data["is_active"] = is_active
    
    # Handle icon upload
    if icon:
        # Delete old icon if exists
        if feature.icon_url:  # type: ignore
            delete_image_file(feature.icon_url)  # type: ignore
        
        # Upload new icon
        icon_url = await save_uploaded_image(icon, subfolder="service_features")
        update_data["icon_url"] = icon_url
    
    # Update feature
    feature_update = ServiceFeatureUpdate(**update_data)
    updated_feature = service_feature_crud.update(db=db, db_obj=feature, obj_in=feature_update)
    updated_feature.merchants = service_merchant_crud.get_by_feature(db=db, feature_id=feature_id)
    
    return updated_feature


@router.delete("/features/{feature_id}")
async def delete_service_feature(
    feature_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a service feature"""
    # Check permissions
    if not getattr(current_user, 'is_superuser', False) and getattr(current_user, 'role', '') != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Get existing feature
    feature = service_feature_crud.get(db=db, id=feature_id)
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    
    # Delete icon if exists
    if feature.icon_url:  # type: ignore
        delete_image_file(feature.icon_url)  # type: ignore
    
    # Delete feature (will cascade delete merchants)
    service_feature_crud.remove(db=db, id=feature_id)
    
    return {"message": "Feature deleted successfully"}


# Service Merchants Endpoints
@router.post("/features/{feature_id}/merchants", response_model=ServiceMerchantResponse)
async def add_merchant_to_feature(
    feature_id: int,
    name: str = Form(...),
    description: Optional[str] = Form(None),
    website_url: Optional[str] = Form(None),
    order_position: int = Form(0),
    logo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a merchant to a service feature (e.g., Indomaret for Top Up)"""
    # Check permissions
    if not getattr(current_user, 'is_superuser', False) and getattr(current_user, 'role', '') != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Verify feature exists
    feature = service_feature_crud.get(db=db, id=feature_id)
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    
    # Handle logo upload
    logo_url = None
    if logo:
        logo_url = await save_uploaded_image(logo, subfolder="merchant_logos")
    
    # Create merchant
    merchant_data = ServiceMerchantCreate(
        feature_id=feature_id,
        name=name,
        description=description,
        website_url=website_url,
        logo_url=logo_url,
        order_position=order_position,
        is_active=True
    )
    
    merchant = service_merchant_crud.create(db=db, obj_in=merchant_data)
    return merchant


@router.get("/features/{feature_id}/merchants", response_model=List[ServiceMerchantResponse])
async def get_feature_merchants(
    feature_id: int,
    db: Session = Depends(get_db)
):
    """Get all merchants for a feature"""
    return service_merchant_crud.get_by_feature(db=db, feature_id=feature_id)


@router.put("/merchants/{merchant_id}", response_model=ServiceMerchantResponse)
async def update_merchant(
    merchant_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    website_url: Optional[str] = Form(None),
    order_position: Optional[int] = Form(None),
    is_active: Optional[bool] = Form(None),
    logo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a merchant"""
    # Check permissions
    if not getattr(current_user, 'is_superuser', False) and getattr(current_user, 'role', '') != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Get existing merchant
    merchant = service_merchant_crud.get(db=db, id=merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    
    # Update data
    update_data = {}
    if name is not None:
        update_data["name"] = name
    if description is not None:
        update_data["description"] = description
    if website_url is not None:
        update_data["website_url"] = website_url
    if order_position is not None:
        update_data["order_position"] = order_position
    if is_active is not None:
        update_data["is_active"] = is_active
    
    # Handle logo upload
    if logo:
        # Delete old logo if exists
        if merchant.logo_url:  # type: ignore
            delete_image_file(merchant.logo_url)  # type: ignore
        
        # Upload new logo
        logo_url = await save_uploaded_image(logo, subfolder="merchant_logos")
        update_data["logo_url"] = logo_url
    
    # Update merchant
    merchant_update = ServiceMerchantUpdate(**update_data)
    updated_merchant = service_merchant_crud.update(db=db, db_obj=merchant, obj_in=merchant_update)
    
    return updated_merchant


@router.delete("/merchants/{merchant_id}")
async def delete_merchant(
    merchant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a merchant"""
    # Check permissions
    if not getattr(current_user, 'is_superuser', False) and getattr(current_user, 'role', '') != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Get existing merchant
    merchant = service_merchant_crud.get(db=db, id=merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    
    # Delete logo if exists
    if merchant.logo_url:  # type: ignore
        delete_image_file(merchant.logo_url)  # type: ignore
    
    # Delete merchant
    service_merchant_crud.remove(db=db, id=merchant_id)
    
    return {"message": "Merchant deleted successfully"}


# Service Gallery Endpoints
@router.post("/{service_id}/gallery", response_model=ServiceGalleryResponse)
async def add_service_gallery_image(
    service_id: int,
    caption: Optional[str] = Form(None),
    alt_text: Optional[str] = Form(None),
    order_position: int = Form(0),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add images to service gallery"""
    # Check permissions
    if not getattr(current_user, 'is_superuser', False) and getattr(current_user, 'role', '') != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Verify service exists
    service = service_crud.get(db=db, id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Upload image
    image_url = await save_uploaded_image(image, subfolder="service_gallery")
    
    # Create gallery entry
    gallery_data = ServiceGalleryCreate(
        service_id=service_id,
        image_url=image_url,
        caption=caption,
        alt_text=alt_text,
        order_position=order_position,
        is_active=True
    )
    
    gallery_item = service_gallery_crud.create(db=db, obj_in=gallery_data)
    return gallery_item


@router.get("/{service_id}/gallery", response_model=List[ServiceGalleryResponse])
async def get_service_gallery(
    service_id: int,
    db: Session = Depends(get_db)
):
    """Get all gallery images for a service"""
    return service_gallery_crud.get_by_service(db=db, service_id=service_id)


# Service Content Sections Endpoints
@router.post("/{service_id}/content", response_model=ServiceContentResponse)
async def create_service_content_section(
    service_id: int,
    section_title: Optional[str] = Form(None),
    content: str = Form(...),
    content_type: str = Form("html"),
    order_position: int = Form(0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a content section for a service"""
    # Check permissions
    if not getattr(current_user, 'is_superuser', False) and getattr(current_user, 'role', '') != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Verify service exists
    service = service_crud.get(db=db, id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Create content section
    content_data = ServiceContentCreate(
        service_id=service_id,
        section_title=section_title,
        content=content,
        content_type=content_type,
        order_position=order_position,
        is_active=True
    )
    
    content_section = service_content_crud.create(db=db, obj_in=content_data)
    return content_section


@router.get("/{service_id}/content", response_model=List[ServiceContentResponse])
async def get_service_content_sections(
    service_id: int,
    db: Session = Depends(get_db)
):
    """Get all content sections for a service"""
    return service_content_crud.get_by_service(db=db, service_id=service_id)
