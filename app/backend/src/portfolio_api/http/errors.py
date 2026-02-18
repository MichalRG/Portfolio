from __future__ import annotations

from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from portfolio_api.domain.errors import (
    Conflict,
    DomainValidationError,
    Forbidden,
    NotFound,
)


def _error_response(
    request: Request,
    *,
    status_code: int,
    code: str,
    message: str,
    details: Any = None,
) -> JSONResponse:
    payload: dict[str, Any] = {
        "error": {
            "code": code,
            "message": message,
            "correlation_id": getattr(request.state, "correlation_id", None),
        }
    }
    if details is not None:
        payload["error"]["details"] = details
    return JSONResponse(status_code=status_code, content=payload)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainValidationError)
    async def _handle_validation_error(
        request: Request, exc: DomainValidationError
    ) -> JSONResponse:
        return _error_response(
            request,
            status_code=400,
            code="validation_error",
            message=exc.message,
        )

    @app.exception_handler(NotFound)
    async def _handle_not_found(request: Request, exc: NotFound) -> JSONResponse:
        return _error_response(
            request, status_code=404, code="not_found", message=exc.message
        )

    @app.exception_handler(Conflict)
    async def _handle_conflict(request: Request, exc: Conflict) -> JSONResponse:
        return _error_response(
            request, status_code=409, code="conflict", message=exc.message
        )

    @app.exception_handler(Forbidden)
    async def _handle_forbidden(request: Request, exc: Forbidden) -> JSONResponse:
        return _error_response(
            request, status_code=403, code="forbidden", message=exc.message
        )

    @app.exception_handler(RequestValidationError)
    async def _handle_request_validation(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return _error_response(
            request,
            status_code=422,
            code="request_validation_error",
            message="Request payload is invalid",
            details=exc.errors(),
        )

    @app.exception_handler(HTTPException)
    async def _handle_http_exception(
        request: Request, exc: HTTPException
    ) -> JSONResponse:
        message = exc.detail if isinstance(exc.detail, str) else "HTTP error"
        code = "http_error"
        if exc.status_code == 404:
            code = "not_found"
        return _error_response(
            request,
            status_code=exc.status_code,
            code=code,
            message=message,
            details=None if isinstance(exc.detail, str) else exc.detail,
        )

    @app.exception_handler(Exception)
    async def _handle_unhandled_exception(
        request: Request, _: Exception
    ) -> JSONResponse:
        return _error_response(
            request,
            status_code=500,
            code="internal_error",
            message="Unexpected server error",
        )
