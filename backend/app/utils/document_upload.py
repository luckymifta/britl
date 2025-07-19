import os
import uuid
from typing import Optional, List
from fastapi import HTTPException, UploadFile
from app.core.config import settings

# Allowed document extensions
ALLOWED_DOCUMENT_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.xls', '.xlsx', '.ppt', '.pptx'}
# Max file size for documents (50MB)
MAX_DOCUMENT_SIZE = 50 * 1024 * 1024  # 50MB


def validate_document(file: UploadFile) -> bool:
    """Validate if uploaded file is a valid document"""
    if not file.content_type:
        return False
    
    # Check file extension
    file_ext = os.path.splitext(file.filename or '')[1].lower()
    if file_ext not in ALLOWED_DOCUMENT_EXTENSIONS:
        return False
    
    # Additional MIME type checks
    allowed_mime_types = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/rtf',
        'application/vnd.oasis.opendocument.text',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
    
    return file.content_type in allowed_mime_types


def generate_unique_document_filename(original_filename: str) -> str:
    """Generate a unique filename while preserving extension"""
    if not original_filename:
        raise ValueError("Original filename is required")
    
    file_ext = os.path.splitext(original_filename)[1].lower()
    unique_id = str(uuid.uuid4())
    return f"{unique_id}{file_ext}"


async def save_uploaded_document(file: UploadFile, subfolder: str = "documents") -> dict:
    """Save uploaded document file and return file info"""
    # Validate file
    if not validate_document(file):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid document file. Allowed types: {', '.join(ALLOWED_DOCUMENT_EXTENSIONS)}"
        )
    
    # Check file size
    file_content = await file.read()
    if len(file_content) > MAX_DOCUMENT_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_DOCUMENT_SIZE // 1024 // 1024}MB."
        )
    
    # Reset file pointer
    await file.seek(0)
    
    # Create directory structure
    upload_dir = os.path.join(settings.upload_folder, subfolder)
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    unique_filename = generate_unique_document_filename(file.filename or 'document.pdf')
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    with open(file_path, 'wb') as f:
        f.write(file_content)
    
    # Return file information
    return {
        "filename": file.filename,
        "saved_filename": unique_filename,
        "file_path": f"{subfolder}/{unique_filename}",
        "file_size": len(file_content),
        "file_type": file.content_type,
        "file_extension": os.path.splitext(file.filename or '')[1].lower()
    }


def delete_document_file(file_path: str) -> bool:
    """Delete a document file from the filesystem"""
    if not file_path:
        return True
    
    full_path = os.path.join(settings.upload_folder, file_path)
    try:
        if os.path.exists(full_path):
            os.remove(full_path)
        return True
    except Exception:
        return False


def get_document_url(file_path: Optional[str]) -> Optional[str]:
    """Convert relative file path to full URL"""
    if not file_path:
        return None
    return f"/static/{file_path}"
