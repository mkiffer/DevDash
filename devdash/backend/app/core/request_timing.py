"""
Adds a Server-Timing header reporting where each request spent its time.

Responsible for: total, database connect and database query durations, and
flagging the first request a container serves. Browser dev tools display the
header in the Network tab's Timing view.

Not responsible for: Lambda's init time, which happens before this code can run
and is reported as Init Duration in the CloudWatch REPORT line.
"""
import time
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass
from typing import Iterator, Optional

from fastapi import Request
from sqlalchemy import event
from sqlalchemy.engine import Engine

MILLISECONDS_PER_SECOND = 1000
QUERY_STARTED_AT_KEY = "request_timing_query_started_at"


@dataclass
class RequestTimings:
    """Durations collected while one request is handled."""

    database_connect_ms: float = 0.0
    database_query_ms: float = 0.0
    connect_started_at: Optional[float] = None


# A ContextVar rather than a module global, because route dependencies run on
# worker threads. FastAPI copies the context to those threads, so they all update
# the same RequestTimings object.
_current_timings: ContextVar[Optional[RequestTimings]] = ContextVar(
    "current_request_timings", default=None
)
_container_has_served_a_request = False


@contextmanager
def collect_timings_into(timings: RequestTimings) -> Iterator[None]:
    """Sends database timings recorded inside this block to the given object."""
    context_token = _current_timings.set(timings)
    try:
        yield
    finally:
        _current_timings.reset(context_token)


def _elapsed_ms(started_at: float) -> float:
    return (time.perf_counter() - started_at) * MILLISECONDS_PER_SECOND


def attach_database_timing(engine: Engine) -> None:
    """
    Records connection and query time for every request using this engine.

    Connect time runs from just before the driver connects until SQLAlchemy has
    finished setting up the connection. On a container's first connection that
    includes SQLAlchemy's one-time setup queries, and any Neon wake-up.
    """

    @event.listens_for(engine, "do_connect")
    def mark_connect_started(dialect, connection_record, connect_args, connect_params):
        timings = _current_timings.get()
        if timings:
            timings.connect_started_at = time.perf_counter()

    @event.listens_for(engine, "connect")
    def record_connect_finished(dbapi_connection, connection_record):
        timings = _current_timings.get()
        if timings and timings.connect_started_at is not None:
            timings.database_connect_ms += _elapsed_ms(timings.connect_started_at)
            timings.connect_started_at = None

    @event.listens_for(engine, "before_cursor_execute")
    def mark_query_started(connection, cursor, statement, parameters, context, executemany):
        connection.info[QUERY_STARTED_AT_KEY] = time.perf_counter()

    @event.listens_for(engine, "after_cursor_execute")
    def record_query_finished(connection, cursor, statement, parameters, context, executemany):
        timings = _current_timings.get()
        query_started_at = connection.info.pop(QUERY_STARTED_AT_KEY, None)
        if timings and query_started_at is not None:
            timings.database_query_ms += _elapsed_ms(query_started_at)


def _format_server_timing(
    total_ms: float, timings: RequestTimings, is_first_request_in_container: bool
) -> str:
    metrics = [f"total;dur={total_ms:.1f}"]
    if timings.database_connect_ms:
        metrics.append(f"db_connect;dur={timings.database_connect_ms:.1f}")
    if timings.database_query_ms:
        metrics.append(f"db_query;dur={timings.database_query_ms:.1f}")
    if is_first_request_in_container:
        metrics.append('cold;desc="First request in this container"')
    return ", ".join(metrics)


async def add_server_timing_header(request: Request, call_next):
    """HTTP middleware that times the request and reports it on the response."""
    global _container_has_served_a_request
    is_first_request_in_container = not _container_has_served_a_request
    _container_has_served_a_request = True

    timings = RequestTimings()
    started_at = time.perf_counter()
    with collect_timings_into(timings):
        response = await call_next(request)

    response.headers["Server-Timing"] = _format_server_timing(
        _elapsed_ms(started_at), timings, is_first_request_in_container
    )
    return response
