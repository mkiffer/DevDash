from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import stack_overflow, chat, hackerrank

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

app = create_application()