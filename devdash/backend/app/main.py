from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import stack_overflow, chat, auth, coding_problems
from app.models.base import Base
from app.database.session import engine  # Import the engine from our new module
from fastapi.responses import JSONResponse


def setup_database():
    """Initialize database on startup if needed"""
    # Create all tables
    Base.metadata.create_all(engine)

def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        debug=settings.DEBUG
    )

    # Configure CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins= settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add a root route to provide API information
    @application.get("/")
    async def root():
        return JSONResponse({
            "app_name": settings.PROJECT_NAME,
            "api_version": "v1",
            "documentation": "/docs",
            "status": "running",
            "available_endpoints": [
                f"{settings.API_V1_STR}/stackoverflow",
                f"{settings.API_V1_STR}/chat"
            ]
        })
    
    # Also add an API version root
    @application.get(f"{settings.API_V1_STR}")
    async def api_root():
        return JSONResponse({
            "version": "v1",
            "status": "running",
            "endpoints": [
                "/stackoverflow",
                "/chat"
            ]
        })
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
        auth.router,
        prefix = f"{settings.API_V1_STR}/auth",
        tags = ["auth"]
    )

    application.include_router(
        coding_problems.router,
        prefix = f"{settings.API_V1_STR}/coding",
        tags = ["coding"]
    )

    return application

setup_database()
app = create_application()