import os
from pathlib import Path
from app.core.config import settings
from datetime import datetime

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def get_allowed_extensions() -> list:
    """Get list of allowed file extensions"""
    return settings.ALLOWED_EXTENSIONS.split(",")

def validate_file(filename: str, file_size: int) -> tuple[bool, str]:
    """Validate uploaded file"""
    # Check file size
    if file_size > settings.MAX_UPLOAD_SIZE:
        return False, f"File size exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB"
    
    # Check file extension
    file_ext = filename.rsplit(".", 1)[1].lower() if "." in filename else ""
    if file_ext not in get_allowed_extensions():
        return False, f"File extension not allowed. Allowed: {settings.ALLOWED_EXTENSIONS}"
    
    return True, "Valid"

def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_")
    return timestamp + original_filename

def save_upload_file(file_content: bytes, filename: str, subfolder: str = "") -> str:
    """Save uploaded file and return the path"""
    if subfolder:
        file_path = UPLOAD_DIR / subfolder
        file_path.mkdir(exist_ok=True)
    else:
        file_path = UPLOAD_DIR
    
    unique_name = generate_unique_filename(filename)
    full_path = file_path / unique_name
    
    with open(full_path, "wb") as f:
        f.write(file_content)
    
    return str(full_path)

def delete_upload_file(file_path: str) -> bool:
    """Delete an uploaded file"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception as e:
        print(f"Error deleting file: {e}")
        return False

def get_file_url(file_path: str, base_url: str = None) -> str:
    """Convert file path to URL"""
    if base_url is None:
        base_url = settings.BACKEND_URL
    
    # Convert Windows path to URL format
    file_path = file_path.replace("\\", "/")
    
    return f"{base_url}/{file_path}"
