from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_user
from app.crud.user import user_crud
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users with optional filtering"""
    # Check if current user is admin
    if not user_crud.is_superuser(current_user):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    # Build query
    query = db.query(User)
    
    # Apply search filter
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%")) |
            (User.username.ilike(f"%{search}%"))
        )
    
    # Apply role filter
    if role:
        query = query.filter(User.role == role)
    
    # Apply status filter
    if status:
        if status == "active":
            query = query.filter(User.is_active == True)
        elif status == "inactive":
            query = query.filter(User.is_active == False)
    
    # Apply pagination
    users = query.offset(skip).limit(limit).all()
    
    return users


@router.get("/stats")
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user statistics"""
    # Check if current user is admin
    if not user_crud.is_superuser(current_user):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    inactive_users = db.query(User).filter(User.is_active == False).count()
    admin_users = db.query(User).filter(User.role == "admin").count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": inactive_users,
        "admin_users": admin_users
    }


@router.post("/", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new user"""
    # Check if current user is admin
    if not user_crud.is_superuser(current_user):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    # Check if user already exists by email
    if user_crud.get_by_email(db, email=user_data.email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if user_crud.get_by_username(db, username=user_data.username):
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )
    
    # Create new user
    user = user_crud.create(db=db, obj_in=user_data)
    return user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user by ID"""
    # Check if current user is admin
    if not user_crud.is_superuser(current_user):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    user = user_crud.get(db=db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user by ID"""
    # Check if current user is admin
    if not user_crud.is_superuser(current_user):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    user = user_crud.get(db=db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    # Check if email is already taken by another user
    if user_update.email and user_update.email != user.email:
        existing_user = user_crud.get_by_email(db, email=user_update.email)
        if existing_user is not None:
            if not bool(existing_user.id == user_id):
                raise HTTPException(
                    status_code=400,
                    detail="Email already registered"
                )
    
    # Check if username is already taken by another user
    if user_update.username and user_update.username != user.username:
        existing_user = user_crud.get_by_username(db, username=user_update.username)
        if existing_user is not None:
            if not bool(existing_user.id == user_id):
                raise HTTPException(
                    status_code=400,
                    detail="Username already taken"
                )
    
    updated_user = user_crud.update(db=db, db_obj=user, obj_in=user_update)
    return updated_user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete user by ID"""
    # Check if current user is admin
    if not user_crud.is_superuser(current_user):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    user = user_crud.get(db=db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    # Prevent deleting self
    if bool(user.id == current_user.id):
        raise HTTPException(
            status_code=400,
            detail="Cannot delete your own account"
        )
    
    user_crud.remove(db=db, id=user_id)
    return {"message": "User deleted successfully"}


@router.patch("/{user_id}/toggle-status")
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle user active status"""
    # Check if current user is admin
    if not user_crud.is_superuser(current_user):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    user = user_crud.get(db=db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    # Prevent deactivating self
    if bool(user.id == current_user.id):
        raise HTTPException(
            status_code=400,
            detail="Cannot deactivate your own account"
        )
    
    # Toggle status
    new_status = not bool(user.is_active)
    user_crud.update(db=db, db_obj=user, obj_in={"is_active": new_status})
    
    return {"message": f"User {'activated' if new_status else 'deactivated'} successfully"}
