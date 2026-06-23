from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes import stack_overflow, chat, auth, coding_problems
from app.database.session import engine, Base
from app.core.config import settings
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan manager for the FastAPI application.
    This will run on startup and shutdown.
    """
    # On startup, create all database tables
    Base.metadata.create_all(bind=engine)
    yield
    # On shutdown, you can add cleanup code here if needed

# Define the app object with the lifespan manager
app = FastAPI(title="DevDash API", lifespan=lifespan)



@app.middleware("http")
async def verify_cdn_origin_secret(request: Request, call_next):
    """
    Reject requests that don't carry the shared secret header injected by
    CloudFront. This guards the public Lambda Function URL so it can only be
    reached through the CDN. When ORIGIN_SHARED_SECRET is unset (e.g. local
    dev), the check is skipped entirely.
    """
    expected_secret = settings.ORIGIN_SHARED_SECRET
    if expected_secret and request.headers.get("x-origin-verify") != expected_secret:
        return JSONResponse(status_code=403, content={"detail": "Forbidden"})
    return await call_next(request)


origins = settings.BACKEND_CORS_ORIGINS

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(stack_overflow.router, prefix="/api/v1/stackoverflow", tags=["stackoverflow"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(coding_problems.router, prefix="/api/v1/coding", tags=["problems"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the DevDash API"}
