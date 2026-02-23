from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Callable
import ulid

from portfolio_api.application.ports.comment_repo import CommentRepository
from portfolio_api.application.time import utc_now
from portfolio_api.domain.comment import Comment
from portfolio_api.domain.errors import NotFound

Clock = Callable[[], datetime]
IdFactory = Callable[[], str]


def default_comment_id_factory() -> str:
    return str(ulid.new())


@dataclass(slots=True)
class CreateCommentService:
    repo: CommentRepository
    clock: Clock = utc_now
    id_factory: IdFactory = default_comment_id_factory

    def execute(
        self,
        *,
        post_slug: str,
        user_name: str,
        content: str,
        email: str | None = None,
        parent_comment_id: str | None = None,
    ) -> Comment:
        normalized_parent_comment_id = Comment.normalize_parent_comment_id(parent_comment_id)
        if normalized_parent_comment_id is not None:
            normalized_slug = Comment.normalize_post_slug(post_slug)
            Comment.validate_post_slug(normalized_slug)
            Comment.validate_parent_comment_id(normalized_parent_comment_id)
            parent_comment = self.repo.get_by_id(
                normalized_slug, normalized_parent_comment_id
            )
            if parent_comment is None:
                raise NotFound("Comment", normalized_parent_comment_id)

        comment = Comment.create(
            comment_id=self.id_factory(),
            parent_comment_id=normalized_parent_comment_id,
            post_slug=post_slug,
            user_name=user_name,
            content=content,
            email=email,
            now=self.clock(),
        )
        return self.repo.create(comment)
