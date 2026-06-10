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
    CASHFREE_ENV: str = "TEST"  # TEST or PROD

    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    class Config:
        env_file = ".env.local"
        case_sensitive = True


settings = Settings()
