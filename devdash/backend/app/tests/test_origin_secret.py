"""Tests for the CloudFront shared-secret origin guard (verify_cdn_origin_secret)."""
import pytest
from httpx import AsyncClient

from app.main import app
from app.core import config


@pytest.fixture
def origin_secret(monkeypatch) -> str:
    """Enable the origin guard with a known secret for the duration of a test."""
    secret = "test-cdn-secret"
    monkeypatch.setattr(config.settings, "ORIGIN_SHARED_SECRET", secret)
    return secret


@pytest.mark.anyio
async def test_request_without_secret_header_is_rejected(origin_secret):
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
    assert response.status_code == 403


@pytest.mark.anyio
async def test_request_with_wrong_secret_is_rejected(origin_secret):
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/", headers={"x-origin-verify": "wrong"})
    assert response.status_code == 403


@pytest.mark.anyio
async def test_request_with_correct_secret_passes(origin_secret):
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/", headers={"x-origin-verify": origin_secret})
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the DevDash API"}


@pytest.mark.anyio
async def test_guard_disabled_when_secret_unset(monkeypatch):
    """With no secret configured (local dev), requests pass without the header."""
    monkeypatch.setattr(config.settings, "ORIGIN_SHARED_SECRET", None)
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
    assert response.status_code == 200
