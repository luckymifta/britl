"""
Public Search Service
Handles public search operations across different content types
"""
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.services.public.news_service import PublicNewsService
from app.services.public.product_service import PublicProductService
from app.services.public.service_service import PublicServiceService


class PublicSearchService:
    """Service for public search operations"""
    
    @staticmethod
    def search_all_content(
        db: Session,
        query: str,
        content_type: str = "all",
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        Search across all public content types
        Returns structured results with content type information
        """
        results = {
            "query": query,
            "results": []
        }
        
        # Calculate limits per content type if searching all
        type_limit = limit // 3 if content_type == "all" else limit
        
        if content_type in ["all", "news"]:
            news_items = PublicNewsService.search_content(
                db, query=query, content_type="news", limit=type_limit
            )
            for item in news_items:
                title = getattr(item, 'title', '') or ''
                excerpt = getattr(item, 'excerpt', '') or ''
                content = excerpt[:200] + "..." if excerpt and len(excerpt) > 200 else excerpt
                results["results"].append({
                    "type": "news",
                    "id": item.id,
                    "title": title,
                    "content": content,
                    "url": f"/news/{item.id}",
                    "created_at": item.created_at
                })
        
        if content_type in ["all", "products"]:
            # Simple search for products
            products = PublicProductService.get_active_products(db, skip=0, limit=type_limit)
            for item in products:
                name = getattr(item, 'name', '') or ''
                description = getattr(item, 'description', '') or ''
                if query.lower() in name.lower() or (description and query.lower() in description.lower()):
                    content = description[:200] + "..." if description and len(description) > 200 else description
                    results["results"].append({
                        "type": "product",
                        "id": item.id,
                        "title": name,
                        "content": content,
                        "url": f"/products/{item.id}",
                        "created_at": item.created_at
                    })
        
        if content_type in ["all", "services"]:
            # Simple search for services
            services = PublicServiceService.get_published_services(db, skip=0, limit=type_limit)
            for item in services:
                name = getattr(item, 'name', '') or ''
                description = getattr(item, 'description', '') or ''
                if query.lower() in name.lower() or (description and query.lower() in description.lower()):
                    content = description[:200] + "..." if description and len(description) > 200 else description
                    results["results"].append({
                        "type": "service",
                        "id": item.id,
                        "title": name,
                        "content": content,
                        "url": f"/services/{item.id}",
                        "created_at": item.created_at
                    })
        
        # Sort results by creation date (newest first)
        results["results"].sort(key=lambda x: x["created_at"], reverse=True)
        
        return results
