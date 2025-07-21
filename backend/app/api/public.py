from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app import crud
from app.services.public.hero_banner_service import PublicHeroBannerService
from app.services.public.team_service import PublicTeamService
from app.services.public.product_service import PublicProductService
from app.services.public.service_service import PublicServiceService
from app.services.public.news_service import PublicNewsService
from app.services.public.search_service import PublicSearchService
from app.schemas import (
    hero_banner as hero_banner_schemas,
    team as team_schemas,
    company as company_schemas,
    product as product_schemas,
    service as service_schemas,
    news as news_schemas,
    contact as contact_schemas
)

router = APIRouter()

# Hero Banners - Public endpoints
@router.get("/hero-banners", response_model=List[hero_banner_schemas.HeroBanner])
def get_public_hero_banners(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get published hero banners for public website"""
    hero_banners = PublicHeroBannerService.get_active_banners(db, skip=skip, limit=limit)
    return hero_banners

@router.get("/hero-banners/{banner_id}", response_model=hero_banner_schemas.HeroBanner)
def get_public_hero_banner(
    banner_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific hero banner by ID - only if active"""
    hero_banner = PublicHeroBannerService.get_banner_by_id(db, banner_id)
    if not hero_banner:
        raise HTTPException(status_code=404, detail="Hero banner not found")
    return hero_banner

@router.get("/hero-banners/featured/main", response_model=hero_banner_schemas.HeroBanner)
def get_featured_hero_banner(db: Session = Depends(get_db)):
    """Get the main featured hero banner for homepage"""
    hero_banner = PublicHeroBannerService.get_featured_banner(db)
    if not hero_banner:
        raise HTTPException(status_code=404, detail="No featured banner available")
    return hero_banner

# Team - Public endpoints
@router.get("/team", response_model=List[team_schemas.TeamMember])
def get_team_members(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get active team members for public display"""
    team_members = PublicTeamService.get_active_members(db, skip=skip, limit=limit)
    return team_members

@router.get("/team/{member_id}", response_model=team_schemas.TeamMember)
def get_public_team_member(
    member_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific team member by ID - only if active"""
    team_member = PublicTeamService.get_member_by_id(db, member_id)
    if not team_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    return team_member

@router.get("/team/department/{department}", response_model=List[team_schemas.TeamMember])
def get_team_by_department(
    department: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get active team members by department"""
    team_members = PublicTeamService.get_members_by_department(db, department, skip=skip, limit=limit)
    return team_members

# Company - Public endpoints
@router.get("/company", response_model=company_schemas.Company)
def get_public_company_info(db: Session = Depends(get_db)):
    """Get company information for public website"""
    company = crud.company.get_company_info(db)
    if not company:
        raise HTTPException(status_code=404, detail="Company information not found")
    return company

# Products - Public endpoints
@router.get("/products", response_model=List[product_schemas.Product])
def get_public_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get published products for public website"""
    if category:
        products = PublicProductService.get_products_by_category(db, category=category, skip=skip, limit=limit)
    else:
        products = PublicProductService.get_active_products(db, skip=skip, limit=limit)
    return products

@router.get("/products/{product_id}", response_model=product_schemas.Product)
def get_public_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific product by ID"""
    product = PublicProductService.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/products/featured", response_model=List[product_schemas.Product])
def get_featured_products(
    limit: int = Query(6, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get featured products for homepage"""
    products = PublicProductService.get_featured_products(db, limit=limit)
    return products

# Services - Public endpoints
@router.get("/services", response_model=List[service_schemas.ServiceResponse])
def get_public_services(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get published services for public website"""
    if category:
        services = PublicServiceService.get_services_by_category(db, category=category, skip=skip, limit=limit)
    else:
        services = PublicServiceService.get_published_services(db, skip=skip, limit=limit)
    return services

@router.get("/services/{service_id}", response_model=service_schemas.ServiceResponse)
def get_public_service(
    service_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific service by ID"""
    service = PublicServiceService.get_service_by_id(db, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.get("/services/featured", response_model=List[service_schemas.ServiceResponse])
def get_featured_services(
    limit: int = Query(6, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get featured services for homepage"""
    services = PublicServiceService.get_featured_services(db, limit=limit)
    return services

# News - Public endpoints
@router.get("/news", response_model=List[news_schemas.NewsResponse])
def get_public_news(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get published news articles for public website"""
    news_items = PublicNewsService.get_published_news(db, skip=skip, limit=limit, category=category)
    return news_items

@router.get("/news/{news_id}", response_model=news_schemas.NewsResponse)
def get_public_news_item(
    news_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific news article by ID"""
    news_item = PublicNewsService.get_news_by_id(db, news_id)
    if not news_item:
        raise HTTPException(status_code=404, detail="News article not found")
    return news_item

@router.get("/news/latest", response_model=List[news_schemas.NewsResponse])
def get_latest_news(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get latest news articles for homepage"""
    news_items = PublicNewsService.get_latest_news(db, limit=limit)
    return news_items

@router.get("/news/featured", response_model=List[news_schemas.NewsResponse])
def get_featured_news(
    limit: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db)
):
    """Get featured news articles for homepage"""
    news_items = PublicNewsService.get_featured_news(db, limit=limit)
    return news_items

# Announcements - Public endpoints
@router.get("/announcements", response_model=List[news_schemas.NewsResponse])
def get_public_announcements(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get published announcements for public website"""
    announcements = PublicNewsService.get_announcements(db, skip=skip, limit=limit, include_expired=False)
    return announcements

@router.get("/announcements/{announcement_id}", response_model=news_schemas.NewsResponse)
def get_public_announcement(
    announcement_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific announcement by ID"""
    announcement = PublicNewsService.get_announcement_by_id(db, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return announcement

@router.get("/announcements/recent", response_model=List[news_schemas.NewsResponse])
def get_recent_announcements(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get recent announcements for homepage banner"""
    announcements = PublicNewsService.get_announcements(db, skip=0, limit=limit, include_expired=False)
    return announcements

# Contact form submission - Public endpoint
@router.post("/contact", response_model=contact_schemas.Contact)
def submit_contact_form(
    contact: contact_schemas.ContactCreate,
    db: Session = Depends(get_db)
):
    """Submit contact form - public endpoint (no authentication required)"""
    try:
        # Create the contact entry
        new_contact = crud.contact.create(db, obj_in=contact)
        
        # TODO: Send confirmation email to customer
        # TODO: Send notification email to admin
        
        return new_contact
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to submit contact form: {str(e)}")

# Search endpoints
@router.get("/search")
def public_search(
    q: str = Query(..., min_length=1),
    content_type: str = Query("all", regex="^(all|news|products|services)$"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search across all public content"""
    return PublicSearchService.search_all_content(
        db, query=q, content_type=content_type, limit=limit
    )
