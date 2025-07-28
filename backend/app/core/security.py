from datetime import datetime, timedelta, time
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from app.core.config import settings

# Constants
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def get_midnight_expiry() -> datetime:
    """Get the next midnight as UTC datetime"""
    # Get current time in UTC
    now = datetime.utcnow()
    
    # Get tomorrow at midnight UTC
    midnight = datetime.combine(now.date() + timedelta(days=1), time.min)
    
    return midnight


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None, until_midnight: bool = True):
    """Create JWT access token that expires at midnight by default"""
    to_encode = data.copy()
    
    if until_midnight:
        # Set expiry to midnight
        expire = get_midnight_expiry()
    elif expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    # Add issued at time and login session ID
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "login_session": datetime.utcnow().isoformat()  # Unique session identifier
    })
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        
        # Check if token has expired
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def refresh_token_if_needed(token: str) -> Optional[str]:
    """Refresh token if it's close to expiry but still valid"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        exp = payload.get("exp")
        
        if exp:
            exp_datetime = datetime.utcfromtimestamp(exp)
            now = datetime.utcnow()
            
            # If token expires in less than 2 hours, create a new one
            if (exp_datetime - now).total_seconds() < 7200:  # 2 hours
                # Create new token with same user data but new expiry
                user_data = {"sub": payload.get("sub")}
                return create_access_token(data=user_data, until_midnight=True)
        
        return None
    except JWTError:
        return None
