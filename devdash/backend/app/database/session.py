import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from app.core.config import settings
import logging
from app.models.base import Base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Top of session.py loading...")

# Construct the database URL from settings
DATABASE_URL=settings.DATABASE_URL

logger.info(f"Attempting to create SQLAlchemy engine with URL: {DATABASE_URL}")

try:
    # NullPool: Lambda containers are short-lived and Neon pools connections at
    # its own proxy, so we don't keep a SQLAlchemy-side pool. pool_pre_ping
    # validates connections to avoid stale-connection errors across cold/warm
    # invocations.
    engine = create_engine(DATABASE_URL, poolclass=NullPool, pool_pre_ping=True)
    logger.info("SQLAlchemy engine object created (but not necessarily connected).")

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info("SessionLocal factory created.")

except Exception as e:
    logger.critical(f"Error during SQLAlchemy engine creation: {e}")
    raise

#Base = declarative_base()

def get_db():
    """
    Dependency to get a database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()