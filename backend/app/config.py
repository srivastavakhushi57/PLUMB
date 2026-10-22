import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PLUMB - Pre-Publication Brand Governance"
    VERSION: str = "1.0.0"
    DEMO_MODE: bool = True
    DATABASE_URL: str = "sqlite+aiosqlite:///./plumb_demo.db"
    JWT_SECRET: str = "plumb_super_secret_jwt_key_2026_demo_brand_guard"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # LLM Settings
    LLM_PROVIDER: str = "gemini"  # "gemini", "mock", "openai"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # Supabase (optional for full cloud deployment)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    
    # Retention & Limits
    AUTO_DELETE_DAYS: int = 90
    MAX_CONTENT_CHARS: int = 50000
    MAX_IMAGE_SIZE_MB: int = 5

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
