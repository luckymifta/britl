from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password, 
    create_access_token, 
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    refresh_token_if_needed,
    get_midnight_expiry
)
from app.api.deps import get_current_user
from app.crud.user import user_crud
from app.schemas.user import UserCreate, UserResponse, UserUpdate, Token
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user"""
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


@router.post("/login", response_model=Token)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user and return access token that expires at midnight"""
    user = user_crud.authenticate_user(
        db, 
        email=form_data.username,  # OAuth2PasswordRequestForm uses 'username' field
        password=form_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not bool(user.is_active):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token that expires at midnight
    access_token = create_access_token(
        data={"sub": user.email}, 
        until_midnight=True
    )
    
    # Set secure HTTP-only cookie for persistent login
    midnight = get_midnight_expiry()
    response.set_cookie(
        key="access_token",
        value=access_token,
        expires=int(midnight.timestamp()),
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax"
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_at": midnight.isoformat(),
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active
        }
    }


@router.post("/logout")
def logout(response: Response):
    """Logout user by clearing the access token cookie"""
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="lax"
    )
    return {"message": "Successfully logged out"}


@router.get("/validate-session")
def validate_session(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user)
):
    """Validate current session and refresh token if needed"""
    # Try to get token from cookie
    token = request.cookies.get("access_token")
    
    if token:
        # Check if token needs refreshing
        new_token = refresh_token_if_needed(token)
        if new_token:
            # Update cookie with new token
            midnight = get_midnight_expiry()
            response.set_cookie(
                key="access_token",
                value=new_token,
                expires=int(midnight.timestamp()),
                httponly=True,
                secure=False,  # Set to True in production with HTTPS
                samesite="lax"
            )
            return {
                "valid": True,
                "token_refreshed": True,
                "new_token": new_token,
                "expires_at": midnight.isoformat(),
                "user": {
                    "id": current_user.id,
                    "email": current_user.email,
                    "full_name": current_user.full_name,
                    "is_active": current_user.is_active
                }
            }
    
    return {
        "valid": True,
        "token_refreshed": False,
        "expires_at": get_midnight_expiry().isoformat(),
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "is_active": current_user.is_active
        }
    }


@router.get("/check-auth")
def check_auth(request: Request):
    """Check if user has valid authentication without requiring login"""
    token = request.cookies.get("access_token")
    if not token:
        return {"authenticated": False}
    
    try:
        from app.core.security import verify_token
        payload = verify_token(token)
        return {
            "authenticated": True,
            "expires_at": get_midnight_expiry().isoformat()
        }
    except HTTPException:
        return {"authenticated": False}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user information"""
    return user_crud.update(db=db, db_obj=current_user, obj_in=user_update)
