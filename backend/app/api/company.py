from typing import Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin_user
from app.crud.company import company
from app.schemas.company import Company, CompanyCreate, CompanyUpdate
from app.utils.file_upload import save_uploaded_image, delete_image_file
import os

router = APIRouter()


@router.get("/", response_model=Company)
def get_company_info(
    db: Session = Depends(get_db),
) -> Any:
    """
    Get company information
    """
    company_info = company.get_company_info(db)
    if not company_info:
        raise HTTPException(
            status_code=404, 
            detail="Company information not found"
        )
    return company_info


@router.post("/", response_model=Company)
def create_or_update_company_info(
    *,
    db: Session = Depends(get_db),
    company_in: CompanyCreate,
    current_user: dict = Depends(get_current_admin_user),
) -> Any:
    """
    Create or update company information
    """
    return company.create_or_update_company(db, obj_in=company_in)


@router.put("/", response_model=Company)
def update_company_info(
    *,
    db: Session = Depends(get_db),
    company_in: CompanyUpdate,
    current_user: dict = Depends(get_current_admin_user),
) -> Any:
    """
    Update company information
    """
    company_info = company.get_company_info(db)
    if not company_info:
        raise HTTPException(
            status_code=404, 
            detail="Company information not found"
        )
    return company.update(db, db_obj=company_info, obj_in=company_in)


@router.post("/with-images", response_model=Company)
async def create_or_update_company_with_images(
    *,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user),
    name: str = Form(...),
    description: str = Form(None),
    mission: str = Form(None),
    vision: str = Form(None),
    values: str = Form(None),
    address: str = Form(None),
    phone: str = Form(None),
    email: str = Form(None),
    website: str = Form(None),
    founded_year: int = Form(None),
    logo: UploadFile = File(None),
    about_image: UploadFile = File(None),
) -> Any:
    """
    Create or update company information with logo and about image upload
    """
    # Get existing company info
    existing_company = company.get_company_info(db)
    
    # Prepare company data
    company_data = {
        "name": name,
        "description": description,
        "mission": mission,
        "vision": vision,
        "values": values,
        "address": address,
        "phone": phone,
        "email": email,
        "website": str(website) if website else None,  # Convert to string explicitly
        "founded_year": founded_year,
    }
    
    # Handle logo upload
    if logo and logo.filename:
        # Delete old logo if exists
        if existing_company and getattr(existing_company, 'logo_url', None):
            delete_image_file(str(existing_company.logo_url))
        
        logo_filename = await save_uploaded_image(logo, "company/logos")
        company_data["logo_url"] = f"/static/{logo_filename}"
    elif existing_company and getattr(existing_company, 'logo_url', None):
        company_data["logo_url"] = str(existing_company.logo_url)
    
    # Handle about image upload
    if about_image and about_image.filename:
        # Delete old about image if exists
        if existing_company and getattr(existing_company, 'about_image_url', None):
            delete_image_file(str(existing_company.about_image_url))
        
        about_image_filename = await save_uploaded_image(about_image, "company/about")
        company_data["about_image_url"] = f"/static/{about_image_filename}"
    elif existing_company and getattr(existing_company, 'about_image_url', None):
        company_data["about_image_url"] = str(existing_company.about_image_url)
    
    # Remove None values
    company_data = {k: v for k, v in company_data.items() if v is not None}
    
    if existing_company:
        # Update existing company
        company_update = CompanyUpdate(**company_data)
        return company.update(db, db_obj=existing_company, obj_in=company_update)
    else:
        # Create new company
        company_create = CompanyCreate(**company_data)
        return company.create(db, obj_in=company_create)


@router.put("/logo", response_model=Company)
async def update_company_logo(
    *,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user),
    logo: UploadFile = File(...),
) -> Any:
    """
    Update company logo
    """
    company_info = company.get_company_info(db)
    if not company_info:
        raise HTTPException(
            status_code=404, 
            detail="Company information not found"
        )
    
    # Delete old logo if exists
    if getattr(company_info, 'logo_url', None):
        delete_image_file(str(company_info.logo_url))
    
    # Upload new logo
    logo_filename = await save_uploaded_image(logo, "company/logos")
    logo_url = f"/static/{logo_filename}"
    
    company_update = CompanyUpdate(logo_url=logo_url)
    return company.update(db, db_obj=company_info, obj_in=company_update)


@router.put("/about-image", response_model=Company)
async def update_company_about_image(
    *,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user),
    about_image: UploadFile = File(...),
) -> Any:
    """
    Update company about image
    """
    company_info = company.get_company_info(db)
    if not company_info:
        raise HTTPException(
            status_code=404, 
            detail="Company information not found"
        )
    
    # Delete old about image if exists
    if getattr(company_info, 'about_image_url', None):
        delete_image_file(str(company_info.about_image_url))
    
    # Upload new about image
    about_image_filename = await save_uploaded_image(about_image, "company/about")
    about_image_url = f"/static/{about_image_filename}"
    
    company_update = CompanyUpdate(about_image_url=about_image_url)
    return company.update(db, db_obj=company_info, obj_in=company_update)


@router.delete("/logo")
def delete_company_logo(
    *,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user),
) -> Any:
    """
    Delete company logo
    """
    company_info = company.get_company_info(db)
    if not company_info:
        raise HTTPException(
            status_code=404, 
            detail="Company information not found"
        )
    
    if not getattr(company_info, 'logo_url', None):
        raise HTTPException(
            status_code=404, 
            detail="Company logo not found"
        )
    
    # Delete logo file
    delete_image_file(str(company_info.logo_url))
    
    # Update database
    company_update = CompanyUpdate(logo_url=None)
    company.update(db, db_obj=company_info, obj_in=company_update)
    
    return {"message": "Company logo deleted successfully"}


@router.delete("/about-image")
def delete_company_about_image(
    *,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user),
) -> Any:
    """
    Delete company about image
    """
    company_info = company.get_company_info(db)
    if not company_info:
        raise HTTPException(
            status_code=404, 
            detail="Company information not found"
        )
    
    if not getattr(company_info, 'about_image_url', None):
        raise HTTPException(
            status_code=404, 
            detail="Company about image not found"
        )
    
    # Delete about image file
    delete_image_file(str(company_info.about_image_url))
    
    # Update database
    company_update = CompanyUpdate(about_image_url=None)
    company.update(db, db_obj=company_info, obj_in=company_update)
    
    return {"message": "Company about image deleted successfully"}
