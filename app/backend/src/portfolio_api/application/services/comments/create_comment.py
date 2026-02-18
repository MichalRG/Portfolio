from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Callable
import ulid

from portfolio_api.application.ports.comment_repo import CommentRepository
from portfolio_api.application.time import utc_now
from portfolio_api.domain.comment import Comment

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
    ) -> Comment:
        comment = Comment.create(
            comment_id=self.id_factory(),
            post_slug=post_slug,
            user_name=user_name,
            content=content,
            email=email,
            now=self.clock(),
        )
        return self.repo.create(comment)
