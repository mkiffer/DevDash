"""
Tests for: core/request_timing.py, the Server-Timing response header.
Coverage intent: total time on every response, database connect and query time,
and flagging the first request a container serves.
Not covered here: real Lambda cold starts, which only exist in production.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool

from app.core import request_timing
from app.main import app


@pytest.mark.anyio
async def test_every_response_reports_total_time():
    """The total is the baseline that makes the other metrics meaningful."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")

    header = response.headers.get("server-timing", "")
    assert "total;dur=" in header, f"Expected a total metric, got {header!r}"


@pytest.mark.anyio
async def test_only_the_first_request_in_a_container_is_flagged_cold(monkeypatch):
    """This separates cold-start delay from ordinary slowness in browser dev tools."""
    monkeypatch.setattr(request_timing, "_container_has_served_a_request", False)

    async with AsyncClient(app=app, base_url="http://test") as client:
        first_response = await client.get("/")
        second_response = await client.get("/")

    assert "cold" in first_response.headers["server-timing"], "First request should be flagged"
    assert "cold" not in second_response.headers["server-timing"], "Later requests are warm"


def test_database_connect_and_query_time_are_recorded_separately():
    """Connect and query need separate numbers, as they have different fixes."""
    engine = create_engine("sqlite://", poolclass=NullPool)
    request_timing.attach_database_timing(engine)
    timings = request_timing.RequestTimings()

    with request_timing.collect_timings_into(timings):
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

    assert timings.database_connect_ms > 0, "Connection time was not recorded"
    assert timings.database_query_ms > 0, "Query time was not recorded"


def test_database_activity_outside_a_request_is_ignored():
    """Scripts and migrations use the same engine and have no request to report on."""
    engine = create_engine("sqlite://", poolclass=NullPool)
    request_timing.attach_database_timing(engine)

    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1")).scalar()

    assert result == 1, "Timing hooks must not interfere with queries outside a request"
