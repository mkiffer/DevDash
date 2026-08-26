import logging

from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.routes import stack_overflow, chat, auth, coding_problems
from app.database.session import engine, Base, get_db
from app.core.config import settings
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

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


@app.get("/api/v1/health")
def health_check(db: Session = Depends(get_db)):
    """
    Liveness plus a real database round trip, for the post-deploy smoke check.

    The two failure modes this has to tell apart are the ones that have actually
    happened: the Lambda itself being unable to start (in which case nothing
    answers at all), and the app being up but unable to reach Neon. So this does
    not just return a literal — it issues a query and reports 503 with the
    database marked unreachable if that fails.

    Left behind the X-Origin-Verify middleware on purpose: the smoke check calls
    it through CloudFront, so a 200 here also proves the CDN path works, which is
    the leg that broke last time.
    """
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        # Logged rather than returned — the client gets a status, not a stack trace.
        logger.exception("Health check failed: database unreachable")
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "unreachable"},
        )

    return {"status": "healthy", "database": "ok"}
