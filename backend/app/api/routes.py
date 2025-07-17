from fastapi import APIRouter
from app.api import auth, products, hero_banners

api_router = APIRouter()

# Authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# Content management routes
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(hero_banners.router, prefix="/hero-banners", tags=["hero-banners"])
