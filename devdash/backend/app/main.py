from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
