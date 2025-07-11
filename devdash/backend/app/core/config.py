from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from dotenv import load_dotenv
from typing import List, Optional # Make sure List is imported

load_dotenv() # For local .env file loading

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Developer Dashboard"

    # This will be populated by the env var BACKEND_CORS_ORIGINS,
    # which App Runner should have set to '["https://..."]'
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173"] # Default for local if env var not set

    STACK_EXCHANGE_API_KEY: Optional[str] = None # Or "" if you prefer
    STACK_EXCHANGE_BASE_URL: str = "https://api.stackexchange.com/2.3"
    ANTHROPIC_API_KEY: Optional[str] = None
    SECRET_KEY: str # No default, should always be set from env/Secrets Manager
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ENVIRONMENT: str = "development"
    DEBUG: bool = False # Default to False for production
    DATABASE_URL: str # No default, should always be set from env/Secrets Manager
    JUDGE0_API_KEY: Optional[str] = None
    USE_MOCK_DATA: bool = True
    #test deployment
    class Config:
        case_sensitive = True
        env_file = ".env" # For local development
        env_file_encoding = 'utf-8'

@lru_cache()
def get_settings() -> Settings:
    try:
        s = Settings()
        return s
    except Exception as e:
        print(f"CRITICAL ERROR loading settings: {e}")
        import traceback
        traceback.print_exc()
        raise

settings = get_settings()