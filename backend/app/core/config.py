from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    API_TITLE: str = "Trendify API"
    API_VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str

    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    CASHFREE_APP_ID: Optional[str] = None
    CASHFREE_SECRET_KEY: Optional[str] = None
    CASHFREE_ENV: str = "TEST"

    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    GOOGLE_CLIENT_ID: Optional[str] = None

    FRONTEND_URL: str = "https://www.trendifytechnologies.in"
    BACKEND_URL: str = "https://trendify-pxkx.onrender.com"

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_NAME: str = "Trendify"
    SMTP_FROM_EMAIL: Optional[str] = None

    RESEND_API_KEY: Optional[str] = None



    class Config:
        env_file = ".env.local"
        case_sensitive = True


settings = Settings()
