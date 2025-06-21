from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings # This will run config.py and initialize settings
from app.models.base import Base
import sys # For flushing output
import time # For adding delays if needed for App Runner log capture

print("DEBUG_SESSION: Top of session.py loading...", flush=True) # Should appear very early
# time.sleep(2) # Optional: short sleep to help ensure log capture

# settings object is already initialized when app.core.config is imported
db_url_to_use = "URL_NOT_SET_OR_ERROR_IN_CONFIG"
try:
    db_url_to_use = settings.DATABASE_URL
    # time.sleep(2)
except Exception as e_config:
    print(f"CRITICAL_SESSION: Error accessing settings.DATABASE_URL: {e_config}", flush=True)
    # time.sleep(2)
    # Potentially re-raise or handle if settings didn't load, though config.py should handle this

engine = None
SessionLocal = None

try:
    print(f"DEBUG_SESSION: Attempting to create SQLAlchemy engine with URL: {db_url_to_use}", flush=True)
    # Add echo=True for very verbose SQLAlchemy logs, remove for production
    engine = create_engine(db_url_to_use, echo=True, pool_pre_ping=True)
    print("DEBUG_SESSION: SQLAlchemy engine object created (but not necessarily connected).", flush=True)

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print("DEBUG_SESSION: SessionLocal factory created.", flush=True)

    # This is a critical step that will try to connect to the DB
    Base.metadata.create_all(bind=engine) # Create tables if they don't exist
    print("DEBUG_SESSION: Base.metadata.create_all(engine) COMPLETED.", flush=True)

except Exception as e_engine:
    print(f"CRITICAL_SESSION: Error during SQLAlchemy engine creation or create_all: {e_engine}", flush=True)
    import traceback
    traceback.print_exc(file=sys.stdout)
    sys.stdout.flush()
    # time.sleep(5) # Sleep to ensure logs are hopefully captured before worker dies
    raise # Re-raise the exception; this will cause the worker to fail to boot.

def get_db():
    if SessionLocal is None:
        # This should not happen if startup was successful
        print("CRITICAL_SESSION: SessionLocal not initialized in get_db!", flush=True)
        raise Exception("Database session not initialized")

    db = SessionLocal()
    try:
        # print("DEBUG_SESSION: DB Session opened.", flush=True) # Can be too noisy
        yield db
    finally:
        # print("DEBUG_SESSION: DB Session closed.", flush=True) # Can be too noisy
        db.close()
