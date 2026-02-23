from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Callable, Mapping

from portfolio_api.application.ports.comment_repo import CommentPatch, CommentRepository
from portfolio_api.application.time import utc_now
from portfolio_api.domain.comment import Comment
from portfolio_api.domain.errors import DomainValidationError, NotFound

Clock = Callable[[], datetime]


@dataclass(slots=True)
class UpdateCommentService:
    repo: CommentRepository
    clock: Clock = utc_now

    def execute(
        self, *, post_slug: str, comment_id: str, patch: Mapping[str, Any]
    ) -> Comment:
        normalized_slug = Comment.normalize_post_slug(post_slug)
        normalized_comment_id = Comment.normalize_comment_id(comment_id)
        Comment.validate_post_slug(normalized_slug)
        Comment.validate_comment_id(normalized_comment_id)
        if not patch:
            raise DomainValidationError("At least one field must be provided for update")

        existing_comment = self.repo.get_by_id(normalized_slug, normalized_comment_id)
        if existing_comment is None:
            raise NotFound("Comment", normalized_comment_id)

        now = self.clock()
        update_kwargs: dict[str, Any] = {"updated_at": now}
        if "user_name" in patch:
            update_kwargs["user_name"] = patch["user_name"]
        if "content" in patch:
            update_kwargs["content"] = patch["content"]
        if "email" in patch:
            update_kwargs["email"] = patch["email"]

        updated_comment = existing_comment.with_updates(**update_kwargs)

        repo_patch: CommentPatch = {"updated_at": now}
        if "user_name" in patch:
            repo_patch["user_name"] = updated_comment.user_name
        if "content" in patch:
            repo_patch["content"] = updated_comment.content
        if "email" in patch:
            repo_patch["email"] = updated_comment.email

        persisted = self.repo.update(normalized_slug, normalized_comment_id, repo_patch)
        if persisted is None:
            raise NotFound("Comment", normalized_comment_id)
        return persisted
