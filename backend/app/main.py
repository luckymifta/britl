from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import api_router

# Create tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="CMS API",
    description="Content Management System API for Company Website",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - simplified configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")

# Create uploads directory if it doesn't exist
os.makedirs(settings.upload_folder, exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=settings.upload_folder), name="static")
app.mount("/uploads", StaticFiles(directory=settings.upload_folder), name="uploads")

# Include routers (we'll create these next)
# from app.api.v1 import auth, dashboard, hero_banner, products, services, news, team, contact, users, logs

# app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
# app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
# app.include_router(hero_banner.router, prefix="/api/v1/hero-banner", tags=["Hero Banner"])
# app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
# app.include_router(services.router, prefix="/api/v1/services", tags=["Services"])
# app.include_router(news.router, prefix="/api/v1/news", tags=["News"])
# app.include_router(team.router, prefix="/api/v1/team", tags=["Team"])
# app.include_router(contact.router, prefix="/api/v1/contact", tags=["Contact"])
# app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
# app.include_router(logs.router, prefix="/api/v1/logs", tags=["Logs"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CMS API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
