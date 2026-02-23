from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Callable

from portfolio_api.application.ports.comment_repo import CommentRepository
from portfolio_api.application.time import utc_now
from portfolio_api.domain.comment import Comment
from portfolio_api.domain.errors import DomainValidationError, NotFound

Clock = Callable[[], datetime]


@dataclass(slots=True)
class DeleteCommentService:
    repo: CommentRepository
    ttl_retention_days: int
    clock: Clock = utc_now

    def __post_init__(self) -> None:
        if self.ttl_retention_days < 1:
            raise DomainValidationError("ttl_retention_days must be greater than 0")

    def execute(self, *, post_slug: str, comment_id: str) -> None:
        normalized_slug = Comment.normalize_post_slug(post_slug)
        normalized_comment_id = Comment.normalize_comment_id(comment_id)
        Comment.validate_post_slug(normalized_slug)
        Comment.validate_comment_id(normalized_comment_id)

        existing = self.repo.get_by_id(normalized_slug, normalized_comment_id)
        if existing is None:
            raise NotFound("Comment", normalized_comment_id)

        now = self.clock()
        expires_at = int((now + timedelta(days=self.ttl_retention_days)).timestamp())
        deleted = self.repo.soft_delete(
            normalized_slug,
            normalized_comment_id,
            deleted_at=now,
            updated_at=now,
            expires_at=expires_at,
        )
        if not deleted:
            raise NotFound("Comment", normalized_comment_id)
