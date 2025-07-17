import os
import uuid
from typing import Optional
from fastapi import HTTPException, UploadFile
from PIL import Image
import io
from app.core.config import settings

# Allowed image extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
# Max image dimensions
MAX_WIDTH = 2048
MAX_HEIGHT = 2048


def validate_image(file: UploadFile) -> bool:
    """Validate if uploaded file is a valid image"""
    if not file.content_type or not file.content_type.startswith('image/'):
        return False
    
    # Check file extension
    file_ext = os.path.splitext(file.filename or '')[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False
    
    return True


def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename while preserving extension"""
    if not original_filename:
        raise ValueError("Original filename is required")
    
    file_ext = os.path.splitext(original_filename)[1].lower()
    unique_id = str(uuid.uuid4())
    return f"{unique_id}{file_ext}"


def resize_image(image_data: bytes, max_width: int = MAX_WIDTH, max_height: int = MAX_HEIGHT) -> bytes:
    """Resize image if it exceeds maximum dimensions"""
    try:
        image = Image.open(io.BytesIO(image_data))
        
        # Convert RGBA to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        
        # Resize if necessary
        if image.width > max_width or image.height > max_height:
            image.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
        
        # Save to bytes
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=85, optimize=True)
        return output.getvalue()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")


async def save_uploaded_image(file: UploadFile, subfolder: str = "products") -> str:
    """Save uploaded image file and return the relative path"""
    # Validate file
    if not validate_image(file):
        raise HTTPException(
            status_code=400,
            detail="Invalid image file. Only JPG, PNG, GIF, and WebP files are allowed."
        )
    
    # Check file size
    file_content = await file.read()
    if len(file_content) > settings.max_file_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {settings.max_file_size // 1024 // 1024}MB."
        )
    
    # Reset file pointer
    await file.seek(0)
    
    # Create directory structure
    upload_dir = os.path.join(settings.upload_folder, subfolder)
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    unique_filename = generate_unique_filename(file.filename or 'image.jpg')
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Resize image if necessary
    resized_image = resize_image(file_content)
    
    # Save file
    with open(file_path, 'wb') as f:
        f.write(resized_image)
    
    # Return relative path for storing in database
    return f"{subfolder}/{unique_filename}"


def delete_image_file(image_path: str) -> bool:
    """Delete an image file from the filesystem"""
    if not image_path:
        return True
    
    full_path = os.path.join(settings.upload_folder, image_path)
    try:
        if os.path.exists(full_path):
            os.remove(full_path)
        return True
    except Exception:
        return False


def get_image_url(image_path: Optional[str]) -> Optional[str]:
    """Convert relative image path to full URL"""
    if not image_path:
        return None
    return f"/static/{image_path}"
