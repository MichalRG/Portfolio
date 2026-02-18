from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from portfolio_api.application.services.comments.create_comment import CreateCommentService
from portfolio_api.application.services.comments.delete_comment import DeleteCommentService
from portfolio_api.application.services.comments.get_comment import GetCommentService
from portfolio_api.application.services.comments.list_comments import ListCommentsService
from portfolio_api.application.services.comments.update_comment import UpdateCommentService
from portfolio_api.domain.comment import Comment
from portfolio_api.domain.errors import NotFound
from tests.fakes.comment_repo import InMemoryCommentRepository

FIXED_NOW = datetime(2026, 1, 1, tzinfo=timezone.utc)
ULID_1 = "01JZ4Y2V9D3MQ8G7RKTY6XP0A1"
ULID_2 = "01JZ4Y2V9D3MQ8G7RKTY6XP0A2"
ULID_3 = "01JZ4Y2V9D3MQ8G7RKTY6XP0A3"
ULID_4 = "01JZ4Y2V9D3MQ8G7RKTY6XP0A4"


def _make_comment(comment_id: str, post_slug: str, offset_seconds: int = 0) -> Comment:
    timestamp = FIXED_NOW + timedelta(seconds=offset_seconds)
    return Comment.create(
        comment_id=comment_id,
        post_slug=post_slug,
        user_name="Jane Doe",
        content="Hello",
        email="jane@example.com",
        now=timestamp,
    )


def test_create_comment_normalizes_input() -> None:
    repo = InMemoryCommentRepository()
    service = CreateCommentService(
        repo=repo,
        id_factory=lambda: ULID_1,
        clock=lambda: FIXED_NOW,
    )

    created = service.execute(
        post_slug="  My-Post  ",
        user_name="  Jane    Doe ",
        content="  test content ",
        email="  USER@Example.COM ",
    )

    assert created.comment_id == ULID_1
    assert created.post_slug == "my-post"
    assert created.user_name == "Jane Doe"
    assert created.content == "test content"
    assert created.email == "user@example.com"


def test_get_comment_raises_not_found() -> None:
    repo = InMemoryCommentRepository()
    service = GetCommentService(repo=repo)

    with pytest.raises(NotFound):
        service.execute(
            post_slug="my-post", comment_id="01JZ4Y2V9D3MQ8G7RKTY6XP0ZZ"
        )


def test_list_comments_supports_cursor_pagination() -> None:
    repo = InMemoryCommentRepository()
    repo.create(_make_comment(ULID_1, "my-post", 1))
    repo.create(_make_comment(ULID_2, "my-post", 2))
    repo.create(_make_comment(ULID_3, "my-post", 3))

    service = ListCommentsService(repo=repo, max_limit=10)
    first_page = service.execute(post_slug="my-post", limit=2)
    second_page = service.execute(
        post_slug="my-post", limit=2, cursor=first_page.next_cursor
    )

    assert [item.comment_id for item in first_page.items] == [ULID_3, ULID_2]
    assert first_page.next_cursor is not None
    assert [item.comment_id for item in second_page.items] == [ULID_1]
    assert second_page.next_cursor is None


def test_update_comment_updates_selected_fields() -> None:
    repo = InMemoryCommentRepository()
    repo.create(_make_comment(ULID_1, "my-post", 1))
    service = UpdateCommentService(repo=repo, clock=lambda: FIXED_NOW + timedelta(days=1))

    updated = service.execute(
        post_slug="my-post",
        comment_id=ULID_1,
        patch={"content": "  Updated  ", "email": None},
    )

    assert updated.content == "Updated"
    assert updated.email is None
    assert updated.updated_at == FIXED_NOW + timedelta(days=1)


def test_delete_comment_soft_deletes_with_ttl() -> None:
    repo = InMemoryCommentRepository()
    repo.create(_make_comment(ULID_4, "my-post", 1))
    deleted_at = FIXED_NOW + timedelta(days=2)
    service = DeleteCommentService(
        repo=repo,
        ttl_retention_days=7,
        clock=lambda: deleted_at,
    )

    service.execute(post_slug="my-post", comment_id=ULID_4)
    hidden = repo.get_by_id("my-post", ULID_4)
    stored = repo._comments[("my-post", ULID_4)]  # noqa: SLF001

    assert hidden is None
    assert stored.deleted_at == deleted_at
    assert stored.expires_at == int((deleted_at + timedelta(days=7)).timestamp())
