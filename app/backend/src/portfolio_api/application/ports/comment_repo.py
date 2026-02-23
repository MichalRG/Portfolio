from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Protocol, TypedDict

from portfolio_api.domain.comment import Comment


class CommentPatch(TypedDict, total=False):
    user_name: str
    content: str
    email: str | None
    updated_at: datetime


@dataclass(slots=True)
class ListCommentsResult:
    items: list[Comment]
    next_cursor: str | None = None


class CommentRepository(Protocol):
    def create(self, comment: Comment) -> Comment:
        ...

    def list_by_post_slug(
        self, slug: str, limit: int, cursor: str | None
    ) -> ListCommentsResult:
        ...

    def get_by_id(self, post_slug: str, comment_id: str) -> Comment | None:
        ...

    def update(self, post_slug: str, comment_id: str, patch: CommentPatch) -> Comment | None:
        ...

    def soft_delete(
        self,
        post_slug: str,
        comment_id: str,
        *,
        deleted_at: datetime,
        updated_at: datetime,
        expires_at: int,
    ) -> bool:
        ...

    def ping(self) -> None:
        ...
