from __future__ import annotations

from dataclasses import dataclass

from portfolio_api.application.ports.comment_repo import (
    CommentRepository,
    ListCommentsResult,
)
from portfolio_api.domain.comment import Comment
from portfolio_api.domain.errors import DomainValidationError


@dataclass(slots=True)
class ListCommentsService:
    repo: CommentRepository
    max_limit: int = 100

    def execute(
        self, *, post_slug: str, limit: int, cursor: str | None = None
    ) -> ListCommentsResult:
        if limit < 1:
            raise DomainValidationError("limit must be greater than 0")
        if limit > self.max_limit:
            raise DomainValidationError(f"limit cannot exceed {self.max_limit}")

        normalized_slug = Comment.normalize_post_slug(post_slug)
        Comment.validate_post_slug(normalized_slug)
        return self.repo.list_by_post_slug(normalized_slug, limit, cursor)
