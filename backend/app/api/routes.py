from fastapi import APIRouter
from app.api import auth, products, hero_banners, company, team, users, services, news

api_router = APIRouter()

# Authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# User management routes
api_router.include_router(users.router, prefix="/users", tags=["users"])

# Content management routes
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(hero_banners.router, prefix="/hero-banners", tags=["hero-banners"])
api_router.include_router(company.router, prefix="/company", tags=["company"])
api_router.include_router(team.router, prefix="/team", tags=["team"])
api_router.include_router(news.router, prefix="/news", tags=["news"])
