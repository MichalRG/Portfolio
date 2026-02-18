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
        "/posts/my-first-post/comments",
        headers={"X-Correlation-Id": "corr-123"},
        json={
            "user_name": "John Doe",
            "content": "Great article!",
            "email": "john@example.com",
        },
    )
    assert create_response.status_code == 201
    assert create_response.headers["X-Correlation-Id"] == "corr-123"
    created_payload = create_response.json()
    comment_id = created_payload["id"]
    assert created_payload["post_slug"] == "my-first-post"

    list_response = client.get("/posts/my-first-post/comments?limit=10")
    assert list_response.status_code == 200
    listed = list_response.json()
    assert listed["next_cursor"] is None
    assert len(listed["items"]) == 1
    assert listed["items"][0]["id"] == comment_id

    get_response = client.get(f"/posts/my-first-post/comments/{comment_id}")
    assert get_response.status_code == 200
    assert get_response.json()["content"] == "Great article!"
