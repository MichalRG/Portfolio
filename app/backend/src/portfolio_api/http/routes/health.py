from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from portfolio_api.application.ports.comment_repo import CommentRepository
from portfolio_api.http.dependencies import get_comment_repo

router = APIRouter(tags=["health"])


@router.get("/health", summary="Health Check", description="Liveness probe endpoint.")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get(
    "/ready",
    summary="Readiness Check",
    description="Checks DynamoDB connectivity via repository ping.",
)
def ready(repo: CommentRepository = Depends(get_comment_repo)) -> dict[str, str]:
    try:
        repo.ping()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="DynamoDB is not ready",
        ) from exc
    return {"status": "ready"}
