from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # API Configurations
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Developer Dashboard"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",# Alternative frontend port
        "https://main.d34kkik6298snw.amplifyapp.com/"
        
    ]
    
    # Stack Exchange API
    STACK_EXCHANGE_API_KEY: str
    STACK_EXCHANGE_BASE_URL: str = "https://api.stackexchange.com/2.3"
    
    # Environment settings
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./chat.db")
    
    # API Keys
    ANTHROPIC_API_KEY: str
    
    
    HACKERRANK_API_KEY: str = "None"
    HACKERRANK_API_URL: str = "https://www.hackerrank.com/api/v3"
    USE_MOCK_DATA: bool = True

    class Config:
        case_sensitive = True
        env_file = ".env"

        # HackerRank API
    

    def check_api_key(self):
        if not self.ANTHROPIC_API_KEY or not self.ANTHROPIC_API_KEY.startswith('sk-ant-'):
            raise ValueError("Invalid or missing Anthropic API key. Key should start with 'sk-ant-'")
        return True

@lru_cache()
def get_settings():
    settings = Settings()
    settings.check_api_key()
    return settings

settings = get_settings()