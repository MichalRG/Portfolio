from __future__ import annotations

import logging
from time import perf_counter
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("portfolio_api.http")


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[override]
        correlation_id = request.headers.get("X-Correlation-Id", uuid4().hex)
        request.state.correlation_id = correlation_id

        logger.info(
            "request_start correlation_id=%s method=%s path=%s",
            correlation_id,
            request.method,
            request.url.path,
        )
        started_at = perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            duration_ms = (perf_counter() - started_at) * 1000
            logger.exception(
                "request_end correlation_id=%s status=%s duration_ms=%.2f",
                correlation_id,
                500,
                duration_ms,
            )
            raise

        duration_ms = (perf_counter() - started_at) * 1000
        response.headers["X-Correlation-Id"] = correlation_id
        logger.info(
            "request_end correlation_id=%s status=%s duration_ms=%.2f",
            correlation_id,
            response.status_code,
            duration_ms,
        )
        return response
