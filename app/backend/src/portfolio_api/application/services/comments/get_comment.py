from __future__ import annotations

from dataclasses import dataclass

from portfolio_api.application.ports.comment_repo import CommentRepository
from portfolio_api.domain.comment import Comment
from portfolio_api.domain.errors import NotFound


@dataclass(slots=True)
class GetCommentService:
    repo: CommentRepository

    def execute(self, *, post_slug: str, comment_id: str) -> Comment:
        normalized_slug = Comment.normalize_post_slug(post_slug)
        normalized_comment_id = Comment.normalize_comment_id(comment_id)
        Comment.validate_post_slug(normalized_slug)
        Comment.validate_comment_id(normalized_comment_id)

        comment = self.repo.get_by_id(normalized_slug, normalized_comment_id)
        if comment is None:
            raise NotFound("Comment", normalized_comment_id)
        return comment
