from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import re
from typing import Any

from portfolio_api.domain.errors import DomainValidationError

POST_SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
MIN_USER_NAME_LENGTH = 2
MAX_USER_NAME_LENGTH = 80
MIN_CONTENT_LENGTH = 1
MAX_CONTENT_LENGTH = 2000
MAX_POST_SLUG_LENGTH = 120
ULID_PATTERN = re.compile(r"^[0-7][0-9A-HJKMNP-TV-Z]{25}$")

MISSING = object()

@dataclass(frozen=True, slots=True)
class Comment:
    comment_id: str
    post_slug: str
    user_name: str
    content: str
    email: str | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    expires_at: int | None = None

    @staticmethod
    def _as_utc(value: datetime) -> datetime:
        if value.tzinfo is None:
            raise DomainValidationError(
                "datetime values must include timezone information"
            )
        return value.astimezone(timezone.utc)

    @classmethod
    def create(
        cls,
        *,
        comment_id: str,
        post_slug: str,
        user_name: str,
        content: str,
        email: str | None,
        now: datetime,
    ) -> "Comment":
        normalized_slug = cls.normalize_post_slug(post_slug)
        normalized_comment_id = cls.normalize_comment_id(comment_id)
        normalized_name = cls.normalize_user_name(user_name)
        normalized_content = cls.normalize_content(content)
        normalized_email = cls.normalize_email(email)

        cls.validate_comment_id(normalized_comment_id)
        cls.validate_post_slug(normalized_slug)
        cls.validate_user_name(normalized_name)
        cls.validate_content(normalized_content)

        ts = cls._as_utc(now)
        return cls(
            comment_id=normalized_comment_id,
            post_slug=normalized_slug,
            user_name=normalized_name,
            content=normalized_content,
            email=normalized_email,
            created_at=ts,
            updated_at=ts,
        )

    def with_updates(
        self,
        *,
        updated_at: datetime,
        user_name: Any = MISSING,
        content: Any = MISSING,
        email: Any = MISSING,
    ) -> "Comment":
        if self.deleted_at is not None:
            raise DomainValidationError("Deleted comments cannot be updated")

        next_user_name = self.user_name
        if user_name is not MISSING:
            next_user_name = self.normalize_user_name(str(user_name))

        next_content = self.content
        if content is not MISSING:
            next_content = self.normalize_content(str(content))

        next_email = self.email
        if email is not MISSING:
            next_email = self.normalize_email(email)

        self.validate_user_name(next_user_name)
        self.validate_content(next_content)

        return Comment(
            comment_id=self.comment_id,
            post_slug=self.post_slug,
            user_name=next_user_name,
            content=next_content,
            email=next_email,
            created_at=self.created_at,
            updated_at=self._as_utc(updated_at),
            deleted_at=self.deleted_at,
            expires_at=self.expires_at,
        )

    def soft_deleted(
        self,
        *,
        deleted_at: datetime,
        updated_at: datetime,
        expires_at: int,
    ) -> "Comment":
        if expires_at <= 0:
            raise DomainValidationError("expires_at must be greater than 0")
        return Comment(
            comment_id=self.comment_id,
            post_slug=self.post_slug,
            user_name=self.user_name,
            content=self.content,
            email=self.email,
            created_at=self.created_at,
            updated_at=self._as_utc(updated_at),
            deleted_at=self._as_utc(deleted_at),
            expires_at=expires_at,
        )

    @staticmethod
    def normalize_post_slug(value: str) -> str:
        return value.strip().lower()

    @staticmethod
    def normalize_comment_id(value: str) -> str:
        return value.strip().upper()

    @staticmethod
    def normalize_user_name(value: str) -> str:
        parts = value.strip().split()
        return " ".join(parts)

    @staticmethod
    def normalize_content(value: str) -> str:
        return value.strip()

    @staticmethod
    def normalize_email(value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip().lower()
        return normalized or None

    @staticmethod
    def validate_comment_id(value: str) -> None:
        if not value:
            raise DomainValidationError("comment_id cannot be empty")
        if ULID_PATTERN.match(value) is None:
            raise DomainValidationError("comment_id must be a valid ULID")

    @staticmethod
    def validate_post_slug(value: str) -> None:
        if not value:
            raise DomainValidationError("post_slug cannot be empty")
        if len(value) > MAX_POST_SLUG_LENGTH:
            raise DomainValidationError(
                f"post_slug cannot exceed {MAX_POST_SLUG_LENGTH} characters"
            )
        if POST_SLUG_PATTERN.match(value) is None:
            raise DomainValidationError("post_slug format is invalid")

    @staticmethod
    def validate_user_name(value: str) -> None:
        length = len(value)
        if length < MIN_USER_NAME_LENGTH:
            raise DomainValidationError(
                f"user_name must be at least {MIN_USER_NAME_LENGTH} characters long"
            )
        if length > MAX_USER_NAME_LENGTH:
            raise DomainValidationError(
                f"user_name cannot exceed {MAX_USER_NAME_LENGTH} characters"
            )

    @staticmethod
    def validate_content(value: str) -> None:
        length = len(value)
        if length < MIN_CONTENT_LENGTH:
            raise DomainValidationError(
                f"content must be at least {MIN_CONTENT_LENGTH} character long"
            )
        if length > MAX_CONTENT_LENGTH:
            raise DomainValidationError(
                f"content cannot exceed {MAX_CONTENT_LENGTH} characters"
            )
