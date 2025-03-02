from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import stack_overflow, chat, hackerrank
from app.models.base import Base
from sqlalchemy import create_engine
from app.core.config import settings

def setup_database():
    """Initialize database on startup if needed"""
    # Only create tables directly in development
    if settings.ENVIRONMENT == "development":
        engine = create_engine(settings.DATABASE_URL)
        Base.metadata.create_all(engine)

def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        debug=settings.DEBUG
    )

    # Configure CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    application.include_router(
        stack_overflow.router,
        prefix=f"{settings.API_V1_STR}/stackoverflow",
        tags=["stackoverflow"]
    )
    # Add chat router - this is the important part
    application.include_router(
        chat.router,
        prefix=f"{settings.API_V1_STR}/chat",
        tags=["chat"]
    )

    application.include_router(
        hackerrank.router,
        prefix=f"{settings.API_V1_STR}/hackerrank",
        tags=["hackerrank"]
    )

    return application

setup_database()
app = create_application()