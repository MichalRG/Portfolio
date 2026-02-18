from __future__ import annotations

import logging

from fastapi import FastAPI
import punq

from portfolio_api.application.ports.comment_repo import CommentRepository
from portfolio_api.config import Settings, get_settings
from portfolio_api.container import build_container
from portfolio_api.http.errors import register_exception_handlers
from portfolio_api.http.middleware.correlation_id import CorrelationIdMiddleware
from portfolio_api.http.routes.comments import router as comments_router
from portfolio_api.http.routes.health import router as health_router


def _configure_logging(log_level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


def create_app(
    *,
    settings: Settings | None = None,
    comment_repo: CommentRepository | None = None,
    container: punq.Container | None = None,
) -> FastAPI:
    runtime_settings = settings or get_settings()
    _configure_logging(runtime_settings.log_level)

    app = FastAPI(
        title=runtime_settings.app_name,
        version=runtime_settings.app_version,
        description=(
            "Portfolio API with layered architecture. "
            "Current module: comments with DynamoDB persistence."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        openapi_tags=[
            {"name": "health", "description": "API liveness and readiness probes."},
            {"name": "comments", "description": "Comments CRUD endpoints."},
        ],
    )
    app.state.container = container or build_container(
        settings=runtime_settings,
        comment_repo=comment_repo,
    )
    app.state.settings = app.state.container.resolve(Settings)
    app.state.comment_repo = app.state.container.resolve(CommentRepository)

    app.add_middleware(CorrelationIdMiddleware)
    register_exception_handlers(app)
    app.include_router(health_router)
    app.include_router(comments_router)
    return app


app = create_app()
