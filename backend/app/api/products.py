from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.crud.product import product
from app.utils.file_upload import save_uploaded_image, delete_image_file, get_image_url

router = APIRouter()


@router.post("/test-form")
async def test_form_data(
    name: str = Form(...),
    price: Optional[str] = Form(None),  # Changed to str to handle empty values
    is_featured: bool = Form(False),
    is_active: bool = Form(True),
    order_position: int = Form(0),
    image: Optional[UploadFile] = File(None)
):
    """Test endpoint to debug form data parsing"""
    
    # Handle price conversion
    price_value = None
    if price and price.strip():
        try:
            price_value = float(price)
        except ValueError:
            price_value = None
    
    return {
        "name": name,
        "price": price_value,
        "price_raw": price,
        "is_featured": is_featured,
        "is_active": is_active,
        "order_position": order_position,
        "has_image": image is not None,
        "image_filename": image.filename if image else None,
        "image_content_type": image.content_type if image else None
    }


@router.get("/", response_model=List[ProductResponse])
def get_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all products (public endpoint)"""
    products = product.get_multi(db, skip=skip, limit=limit)
    return products


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific product by ID (public endpoint)"""
    product_obj = product.get(db=db, id=product_id)
    if not product_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product_obj


@router.post("/", response_model=ProductResponse)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new product (admin only)"""
    product_obj = product.create(db=db, obj_in=product_data)
    return product_obj


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a product (admin only)"""
    product_obj = product.get(db=db, id=product_id)
    if not product_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    product_obj = product.update(db=db, db_obj=product_obj, obj_in=product_data)
    return product_obj


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a product (admin only)"""
    product_obj = product.get(db=db, id=product_id)
    if not product_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    product.remove(db=db, id=product_id)
    return {"message": "Product deleted successfully"}


@router.post("/with-image", response_model=ProductResponse)
async def create_product_with_image(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    short_description: Optional[str] = Form(None),
    price: Optional[str] = Form(None),  # Changed to str to handle empty values
    category: Optional[str] = Form(None),
    features: Optional[str] = Form(None),
    specifications: Optional[str] = Form(None),
    is_featured: bool = Form(False),
    is_active: bool = Form(True),
    order_position: int = Form(0),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new product with image upload (admin only)"""
    try:
        print(f"DEBUG: Received product creation request from user: {current_user.email}")
        print(f"DEBUG: Product name: {name}")
        print(f"DEBUG: Has image: {image is not None}")
        print(f"DEBUG: Image filename: {image.filename if image else 'None'}")
        print(f"DEBUG: Price: {price}, Type: {type(price)}")
        print(f"DEBUG: is_featured: {is_featured}, Type: {type(is_featured)}")
        print(f"DEBUG: is_active: {is_active}, Type: {type(is_active)}")
        print(f"DEBUG: order_position: {order_position}, Type: {type(order_position)}")
        
        image_url = None
        if image and image.filename:
            print("DEBUG: Processing image upload...")
            # Upload and save image
            image_path = await save_uploaded_image(image, "products")
            image_url = get_image_url(image_path)
            print(f"DEBUG: Image saved to: {image_path}")
            print(f"DEBUG: Image URL: {image_url}")
        
        # Handle price conversion - convert empty string to None
        price_value = None
        if price and price.strip():
            try:
                price_value = float(price)
            except ValueError:
                raise HTTPException(
                    status_code=422,
                    detail="Price must be a valid number"
                )
        
        # Create product data
        product_data = ProductCreate(
            name=name,
            description=description,
            short_description=short_description,
            price=price_value,  # Use the converted value
            category=category,
            features=features,
            specifications=specifications,
            image_url=image_url,
            is_featured=is_featured,
            is_active=is_active,
            order_position=order_position
        )
        
        print(f"DEBUG: ProductCreate data: {product_data}")
        
        product_obj = product.create(db=db, obj_in=product_data)
        print(f"DEBUG: Product created successfully with ID: {product_obj.id}")
        return product_obj
        
    except Exception as e:
        print(f"ERROR: Failed to create product: {str(e)}")
        print(f"ERROR: Exception type: {type(e)}")
        import traceback
        print(f"ERROR: Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create product: {str(e)}"
        )


@router.put("/{product_id}/image", response_model=ProductResponse)
async def update_product_image(
    product_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update product image (admin only)"""
    product_obj = product.get(db=db, id=product_id)
    if not product_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Delete old image if exists
    old_image_url = getattr(product_obj, 'image_url', None)
    if old_image_url:
        old_image_path = old_image_url.replace("/static/", "")
        delete_image_file(old_image_path)
    
    # Upload new image
    image_path = await save_uploaded_image(image, "products")
    image_url = get_image_url(image_path)
    
    # Update product with new image URL
    update_data = {"image_url": image_url}
    product_obj = product.update(db=db, db_obj=product_obj, obj_in=update_data)
    return product_obj


@router.post("/{product_id}/gallery", response_model=ProductResponse)
async def add_gallery_image(
    product_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Add image to product gallery (admin only)"""
    product_obj = product.get(db=db, id=product_id)
    if not product_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Upload image
    image_path = await save_uploaded_image(image, "products/gallery")
    image_url = get_image_url(image_path)
    
    # Add to gallery_images (assuming it's a JSON array or comma-separated string)
    current_gallery = getattr(product_obj, 'gallery_images', None) or ""
    if current_gallery:
        new_gallery = f"{current_gallery},{image_url}"
    else:
        new_gallery = image_url
    
    # Update product with new gallery
    update_data = {"gallery_images": new_gallery}
    product_obj = product.update(db=db, db_obj=product_obj, obj_in=update_data)
    return product_obj


@router.delete("/{product_id}/image")
async def delete_product_image(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete product main image (admin only)"""
    product_obj = product.get(db=db, id=product_id)
    if not product_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Delete image file if exists
    current_image_url = getattr(product_obj, 'image_url', None)
    if current_image_url:
        image_path = current_image_url.replace("/static/", "")
        delete_image_file(image_path)
        
        # Remove image URL from database
        update_data = {"image_url": None}
        product.update(db=db, db_obj=product_obj, obj_in=update_data)
        
        return {"message": "Product image deleted successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No image found for this product"
        )


@router.delete("/{product_id}/gallery")
async def clear_product_gallery(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Clear all gallery images for a product (admin only)"""
    product_obj = product.get(db=db, id=product_id)
    if not product_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Delete all gallery image files if they exist
    current_gallery = getattr(product_obj, 'gallery_images', None)
    if current_gallery:
        gallery_urls = current_gallery.split(',')
        for url in gallery_urls:
            if url.strip():
                image_path = url.strip().replace("/static/", "")
                delete_image_file(image_path)
        
        # Clear gallery from database
        update_data = {"gallery_images": None}
        product.update(db=db, db_obj=product_obj, obj_in=update_data)
        
        return {"message": "Product gallery cleared successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No gallery images found for this product"
        )
