from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_admin_user
from app.crud.product import product as crud_product
from app.schemas.product import Product, ProductCreate, ProductUpdate
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[Product])
def read_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve products with pagination.
    """
    products = crud_product.get_multi(db, skip=skip, limit=limit)
    return products


@router.post("/", response_model=Product)
def create_product(
    *,
    db: Session = Depends(get_db),
    product_in: ProductCreate,
    current_user: User = Depends(get_current_admin_user)
):
    """
    Create new product.
    """
    return crud_product.create(db=db, obj_in=product_in)


@router.get("/featured", response_model=List[Product])
def read_featured_products(db: Session = Depends(get_db)):
    """
    Get featured products.
    """
    return crud_product.get_featured(db)


@router.get("/category/{category}", response_model=List[Product])
def read_products_by_category(
    category: str,
    db: Session = Depends(get_db)
):
    """
    Get products by category.
    """
    return crud_product.get_by_category(db, category=category)


@router.get("/{product_id}", response_model=Product)
def read_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Get product by ID.
    """
    product = crud_product.get(db=db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.put("/{product_id}", response_model=Product)
def update_product(
    *,
    db: Session = Depends(get_db),
    product_id: int,
    product_in: ProductUpdate,
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update product.
    """
    product = crud_product.get(db=db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    product = crud_product.update(db=db, db_obj=product, obj_in=product_in)
    return product


@router.delete("/{product_id}")
def delete_product(
    *,
    db: Session = Depends(get_db),
    product_id: int,
    current_user: User = Depends(get_current_admin_user)
):
    """
    Delete product.
    """
    product = crud_product.get(db=db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    crud_product.remove(db=db, id=product_id)
    return {"message": "Product deleted successfully"}
