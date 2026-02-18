from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

from portfolio_api.domain.comment import (
    MAX_CONTENT_LENGTH,
    MAX_USER_NAME_LENGTH,
    MIN_CONTENT_LENGTH,
    MIN_USER_NAME_LENGTH,
)
from portfolio_api.domain.comment import Comment as DomainComment


class CreateCommentRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_name: str = Field(
        min_length=MIN_USER_NAME_LENGTH,
        max_length=MAX_USER_NAME_LENGTH,
        description="Display name visible with the comment.",
        examples=["John Doe"],
    )
    content: str = Field(
        min_length=MIN_CONTENT_LENGTH,
        max_length=MAX_CONTENT_LENGTH,
        description="Comment body text.",
        examples=["Great article, thanks for sharing."],
    )
    email: EmailStr | None = Field(
        default=None,
        description="Optional email used for moderation workflows.",
        examples=["john@example.com"],
    )


class UpdateCommentRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_name: str | None = Field(
        default=None,
        min_length=MIN_USER_NAME_LENGTH,
        max_length=MAX_USER_NAME_LENGTH,
        description="Updated display name.",
        examples=["John Smith"],
    )
    content: str | None = Field(
        default=None,
        min_length=MIN_CONTENT_LENGTH,
        max_length=MAX_CONTENT_LENGTH,
        description="Updated comment body.",
        examples=["Updated comment text."],
    )
    email: EmailStr | None = Field(
        default=None,
        description="Updated email. Use null to clear the current value.",
        examples=["john.smith@example.com"],
    )

    @model_validator(mode="after")
    def validate_not_empty_payload(self) -> "UpdateCommentRequest":
        if not self.model_fields_set:
            raise ValueError("At least one field must be provided")
        return self


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(description="Comment ULID identifier.")
    post_slug: str = Field(description="Post identifier.")
    user_name: str = Field(description="Comment author display name.")
    content: str = Field(description="Comment body.")
    email: str | None = Field(default=None, description="Optional author email.")
    created_at: datetime = Field(description="Comment creation timestamp (UTC).")
    updated_at: datetime = Field(description="Last update timestamp (UTC).")
    deleted_at: datetime | None = Field(
        default=None, description="Soft delete timestamp if deleted."
    )

    @classmethod
    def from_domain(cls, comment: DomainComment) -> "CommentResponse":
        return cls(
            id=comment.comment_id,
            post_slug=comment.post_slug,
            user_name=comment.user_name,
            content=comment.content,
            email=comment.email,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            deleted_at=comment.deleted_at,
        )


class ListCommentsResponse(BaseModel):
    items: list[CommentResponse] = Field(description="Current comments page.")
    next_cursor: str | None = Field(
        default=None,
        description="Opaque pagination cursor. Pass it to fetch the next page.",
    )
