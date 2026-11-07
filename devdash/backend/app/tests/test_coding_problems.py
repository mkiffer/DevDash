"""
Tests for: routes/coding_problems.py, the challenge read and submission routes.
Coverage intent: browser and CDN cache headers on public reads, keeping hidden
test cases out of those cacheable responses, and how submissions poll Judge0.
Not covered here: the language test runners, or real calls to Judge0 (faked below).
"""
import json

import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.main import app
from app.database.session import get_db
from app.models.codingproblem import CodingProblem
from app.routes import coding_problems

JUDGE0_FINISHED_STATUS = {"id": 3, "description": "Accepted"}


@pytest.fixture
def seeded_problem(db_session: Session) -> CodingProblem:
    """Stores one problem and points the API at the in-memory test database."""
    problem = CodingProblem(
        title="Two Sum",
        slug="two-sum",
        difficulty="Easy",
        description="Find two numbers that add up to the target.",
        example_cases=[{"input": {"a": 1}, "output": 1}],
        test_cases=[{"input": {"a": "HIDDEN_CASE"}, "output": 1}],
        starter_code={"python": "def two_sum(a): pass"},
        example_input="a",
    )
    db_session.add(problem)
    db_session.commit()

    def get_test_db():
        yield db_session

    app.dependency_overrides[get_db] = get_test_db
    yield problem
    app.dependency_overrides.clear()


class FakeJudge0Client:
    """Replaces httpx.AsyncClient so submissions never reach Judge0."""

    polls_until_finished = 1
    on_first_request = None

    def __init__(self, *args, **kwargs):
        self.status_checks = 0

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exception_details):
        return False

    async def post(self, *args, **kwargs):
        if FakeJudge0Client.on_first_request:
            FakeJudge0Client.on_first_request()
        return _fake_response({"token": "fake-token"})

    async def get(self, *args, **kwargs):
        self.status_checks += 1
        is_finished = self.status_checks >= FakeJudge0Client.polls_until_finished
        status = JUDGE0_FINISHED_STATUS if is_finished else {"id": 2, "description": "Processing"}
        stdout = json.dumps([{"test_case": 1, "passed": True}]) if is_finished else None
        return _fake_response({"status": status, "stdout": stdout})


def _fake_response(body: dict):
    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return body

    return FakeResponse()


@pytest.fixture
def recorded_sleeps(monkeypatch) -> list[float]:
    """Fakes Judge0 and records each polling delay, so tests run instantly."""
    delays: list[float] = []

    async def record_sleep(seconds: float):
        delays.append(seconds)

    monkeypatch.setattr(coding_problems.asyncio, "sleep", record_sleep)
    monkeypatch.setattr(coding_problems, "AsyncClient", FakeJudge0Client)
    monkeypatch.setattr(FakeJudge0Client, "polls_until_finished", 1)
    monkeypatch.setattr(FakeJudge0Client, "on_first_request", None)
    return delays


async def _submit_solution():
    async with AsyncClient(app=app, base_url="http://test") as client:
        return await client.post(
            "/api/v1/coding/problems/two-sum/submit",
            json={"code": "def two_sum(a): return 1", "language": "python"},
        )


@pytest.mark.anyio
@pytest.mark.parametrize("path", ["/api/v1/coding/problems", "/api/v1/coding/problems/two-sum"])
async def test_public_challenge_reads_can_be_cached(seeded_problem, path):
    """The CDN can only skip the slow backend if the origin marks reads as public."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(path)

    assert response.status_code == 200, f"Expected {path} to succeed, got {response.status_code}"
    cache_control = response.headers.get("cache-control", "")
    assert "public" in cache_control, f"{path} must be publicly cacheable, got {cache_control!r}"
    assert "s-maxage=" in cache_control, f"{path} must set a CDN lifetime, got {cache_control!r}"


@pytest.mark.anyio
async def test_missing_challenge_is_not_marked_cacheable(seeded_problem):
    """A long-lived cached 404 would hide a challenge after it is added."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/coding/problems/does-not-exist")

    assert response.status_code == 404, "Unknown slugs should return 404"
    assert "public" not in response.headers.get("cache-control", ""), (
        "404 responses must not ask the CDN to cache them for the full lifetime"
    )


@pytest.mark.anyio
@pytest.mark.parametrize("path", ["/api/v1/coding/problems", "/api/v1/coding/problems/two-sum"])
async def test_cacheable_reads_never_contain_hidden_test_cases(seeded_problem, path):
    """Cached responses are public, so a leak here would expose the answers to everyone."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(path)

    assert "HIDDEN_CASE" not in response.text, f"{path} exposed hidden test cases"


@pytest.mark.anyio
async def test_submission_checks_judge0_within_a_second(seeded_problem, recorded_sleeps):
    """Short programs finish quickly, so a fixed 2 s first wait is wasted time."""
    response = await _submit_solution()

    assert response.status_code == 200, f"Submission failed: {response.text}"
    assert recorded_sleeps[0] <= 1, f"First status check waited {recorded_sleeps[0]} s"


@pytest.mark.anyio
async def test_submission_polling_stays_well_inside_gateway_limit(
    seeded_problem, recorded_sleeps, monkeypatch
):
    """API Gateway stops at 30 s, and polling must leave room for a cold start."""
    monkeypatch.setattr(FakeJudge0Client, "polls_until_finished", 1000)

    await _submit_solution()

    assert sum(recorded_sleeps) <= 20, f"Polling waited {sum(recorded_sleeps)} s in total"


@pytest.mark.anyio
async def test_database_session_is_released_before_calling_judge0(
    seeded_problem, recorded_sleeps, db_session, monkeypatch
):
    """Polling can take 20 s, and a database transaction must not stay open throughout."""
    transaction_states: list[bool] = []
    monkeypatch.setattr(
        FakeJudge0Client,
        "on_first_request",
        lambda: transaction_states.append(db_session.in_transaction()),
    )

    response = await _submit_solution()

    assert response.status_code == 200, f"Submission failed: {response.text}"
    assert transaction_states == [False], "A transaction was still open when Judge0 was called"
