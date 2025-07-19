import pytest
import sys
import os
from typing import AsyncGenerator, Generator
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.main import app
from app.database.session import Base
from app.dependencies import get_db
from app.models.user import User
from app.auth.utils import get_password_hash
from app.services.auth_service import create_access_token

# --- Import all models here ---
# This is the crucial change. By importing the models here, we ensure that
# SQLAlchemy's Base object knows about them before we call create_all().
from app.models.base import Base
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.models.codingproblem import CodingProblem


SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Fixture to override the get_db dependency and use the test database
@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """
    Fixture to provide a test database session.
    This will create all tables, yield a session, and then drop all tables after tests are done.
    """
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


# Fixture to create a test user in the database
@pytest.fixture(scope="function")
def test_user(db_session: Session) -> User:
    """
    Fixture to create and save a test user to the database.
    """
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpassword"),
    )
    db_session.add(user)
    db_session.commit()
    return user

# Fixture for an authenticated test client
@pytest.fixture(scope="function")
async def authenticated_client(test_user: User, db_session: Session) -> AsyncGenerator[AsyncClient, None]:
    """
    Fixture to provide an authenticated HTTPX AsyncClient for a single test.
    """
    def get_test_db():
        yield db_session

    app.dependency_overrides[get_db] = get_test_db

    token = create_access_token(data={"sub": test_user.username})
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        client.cookies["access_token"] = token
        yield client

