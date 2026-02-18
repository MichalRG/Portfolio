from __future__ import annotations

from datetime import datetime

from portfolio_api.application.ports.comment_repo import (
    CommentPatch,
    CommentRepository,
    ListCommentsResult,
)
from portfolio_api.domain.comment import Comment
from portfolio_api.domain.errors import Conflict, DomainValidationError


class InMemoryCommentRepository(CommentRepository):
    def __init__(self) -> None:
        self._comments: dict[tuple[str, str], Comment] = {}

    @staticmethod
    def _key(post_slug: str, comment_id: str) -> tuple[str, str]:
        return (post_slug, comment_id)

    def create(self, comment: Comment) -> Comment:
        key = self._key(comment.post_slug, comment.comment_id)
        if key in self._comments:
            raise Conflict(f"Comment '{comment.comment_id}' already exists")
        self._comments[key] = comment
        return comment

    def list_by_post_slug(
        self, slug: str, limit: int, cursor: str | None
    ) -> ListCommentsResult:
        visible = [
            comment
            for comment in self._comments.values()
            if comment.post_slug == slug and comment.deleted_at is None
        ]
        visible.sort(key=lambda comment: comment.created_at, reverse=True)

        if cursor is None:
            start = 0
        else:
            try:
                start = int(cursor)
            except ValueError as exc:
                raise DomainValidationError("cursor is invalid") from exc
            if start < 0:
                raise DomainValidationError("cursor is invalid")

        end = start + limit
        next_cursor = str(end) if end < len(visible) else None
        return ListCommentsResult(items=visible[start:end], next_cursor=next_cursor)

    def get_by_id(self, post_slug: str, comment_id: str) -> Comment | None:
        comment = self._comments.get(self._key(post_slug, comment_id))
        if comment is None or comment.deleted_at is not None:
            return None
        return comment

    def update(
        self, post_slug: str, comment_id: str, patch: CommentPatch
    ) -> Comment | None:
        current = self.get_by_id(post_slug, comment_id)
        if current is None:
            return None
        update_kwargs: dict[str, object] = {"updated_at": patch["updated_at"]}
        if "user_name" in patch:
            update_kwargs["user_name"] = patch["user_name"]
        if "content" in patch:
            update_kwargs["content"] = patch["content"]
        if "email" in patch:
            update_kwargs["email"] = patch["email"]
        updated = current.with_updates(**update_kwargs)
        self._comments[self._key(post_slug, comment_id)] = updated
        return updated

    def soft_delete(
        self,
        post_slug: str,
        comment_id: str,
        *,
        deleted_at: datetime,
        updated_at: datetime,
        expires_at: int,
    ) -> bool:
        current = self.get_by_id(post_slug, comment_id)
        if current is None:
            return False
        deleted = current.soft_deleted(
            deleted_at=deleted_at, updated_at=updated_at, expires_at=expires_at
        )
        self._comments[self._key(post_slug, comment_id)] = deleted
        return True

    def ping(self) -> None:
        return
