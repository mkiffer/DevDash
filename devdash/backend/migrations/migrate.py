import os
import sys
import alembic.config
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.base import Base
from app.models.chat import ChatSession, ChatMessage

def run_migrations() -> None:
    """Run database migrations using Alembic"""
    alembic_args = [
        '--raiseerr',
        'upgrade', 'head',
    ]
    alembic.config.main(argv=alembic_args)

def setup_database() -> None:
    """Create initial database tables if they don't exist"""
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(engine)
    print(f"Database initialized with URL: {settings.DATABASE_URL}")

if __name__ == "__main__":
    # Check if we should run Alembic migrations or just setup tables
    if len(sys.argv) > 1 and sys.argv[1] == "--alembic":
        print("Running Alembic migrations...")
        run_migrations()
    else:
        print("Setting up database tables...")
        setup_database()
