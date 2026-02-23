from __future__ import annotations

from fastapi.testclient import TestClient

from portfolio_api.config import Settings
from portfolio_api.main import create_app
from tests.fakes.comment_repo import InMemoryCommentRepository


def test_comments_routes_with_in_memory_repo() -> None:
    repo = InMemoryCommentRepository()
    settings = Settings(
        comments_table_name="test-comments",
        ttl_retention_days=30,
    )
    app = create_app(settings=settings, comment_repo=repo)
    client = TestClient(app)

    create_response = client.post(
        "/api/v1/comments/my-first-post",
        headers={"X-Correlation-Id": "corr-123"},
        json={
            "user_name": "John Doe",
            "content": "Great article!",
            "email": "john@example.com",
            "honeypot": "",
        },
    )
    assert create_response.status_code == 201
    assert create_response.headers["X-Correlation-Id"] == "corr-123"
    created_payload = create_response.json()
    comment_id = created_payload["id"]
    assert created_payload["parent_comment_id"] is None
    assert created_payload["post_slug"] == "my-first-post"

    reply_response = client.post(
        "/api/v1/comments/my-first-post",
        json={
            "user_name": "John Reply",
            "content": "Replying to your comment",
            "parent_comment_id": comment_id.lower(),
            "honeypot": "",
        },
    )
    assert reply_response.status_code == 201
    reply_payload = reply_response.json()
    assert reply_payload["parent_comment_id"] == comment_id

    list_response = client.get("/api/v1/comments/my-first-post?limit=10")
    assert list_response.status_code == 200
    listed = list_response.json()
    assert listed["next_cursor"] is None
    assert len(listed["items"]) == 2
    assert listed["items"][0]["id"] == reply_payload["id"]
    assert listed["items"][0]["parent_comment_id"] == comment_id
    assert listed["items"][1]["id"] == comment_id

    get_response = client.get(f"/api/v1/comments/my-first-post/{comment_id}")
    assert get_response.status_code == 200
    assert get_response.json()["content"] == "Great article!"


def test_create_comment_rejects_non_empty_honeypot() -> None:
    repo = InMemoryCommentRepository()
    settings = Settings(
        comments_table_name="test-comments",
        ttl_retention_days=30,
    )
    app = create_app(settings=settings, comment_repo=repo)
    client = TestClient(app)

    create_response = client.post(
        "/api/v1/comments/my-first-post",
        json={
            "user_name": "John Doe",
            "content": "Great article!",
            "honeypot": "spam-link",
        },
    )

    assert create_response.status_code == 400
