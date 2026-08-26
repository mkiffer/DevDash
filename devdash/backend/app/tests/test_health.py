"""Tests for the /api/v1/health endpoint used by the post-deploy smoke check."""
import pytest
from httpx import AsyncClient
from sqlalchemy.exc import OperationalError

from app.main import app
from app.database.session import get_db


@pytest.fixture
def healthy_db(db_session):
    """Point the endpoint at the in-memory test database."""
    def get_test_db():
        yield db_session

    app.dependency_overrides[get_db] = get_test_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def unreachable_db():
    """Simulate Neon being unreachable: the session raises on execute()."""
    class BrokenSession:
        def execute(self, *args, **kwargs):
            raise OperationalError("SELECT 1", {}, Exception("connection refused"))

    def get_broken_db():
        yield BrokenSession()

    app.dependency_overrides[get_db] = get_broken_db
    yield
    app.dependency_overrides.clear()


@pytest.mark.anyio
async def test_health_returns_200_when_database_reachable(healthy_db):
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "database": "ok"}


@pytest.mark.anyio
async def test_health_returns_503_when_database_unreachable(unreachable_db):
    """
    A database failure must surface as 503, not as an unhandled 500 — the smoke
    check needs to distinguish "app is down" from "app is up, database is not".
    """
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/health")

    assert response.status_code == 503
    assert response.json() == {"status": "unhealthy", "database": "unreachable"}


@pytest.mark.anyio
async def test_health_does_not_leak_error_details(unreachable_db):
    """The failure reason is logged server-side, never returned to the caller."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/health")

    assert "connection refused" not in response.text
