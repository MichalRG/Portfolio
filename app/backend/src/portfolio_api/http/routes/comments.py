from __future__ import annotations

from fastapi import APIRouter, Depends, Path, Query, Response, status

from portfolio_api.application.services.comments.create_comment import CreateCommentService
from portfolio_api.application.services.comments.delete_comment import DeleteCommentService
from portfolio_api.application.services.comments.get_comment import GetCommentService
from portfolio_api.application.services.comments.list_comments import ListCommentsService
from portfolio_api.application.services.comments.update_comment import UpdateCommentService
from portfolio_api.config import Settings
from portfolio_api.http.dependencies import (
    get_create_comment_service,
    get_delete_comment_service,
    get_get_comment_service,
    get_list_comments_service,
    get_settings,
    get_update_comment_service,
)
from portfolio_api.http.dto import (
    CommentResponse,
    CreateCommentRequest,
    ListCommentsResponse,
    UpdateCommentRequest,
)

router = APIRouter(tags=["comments"])


@router.post(
    "/posts/{post_slug}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Comment",
    description="Create a new comment for the selected post slug.",
    responses={
        400: {"description": "Validation error"},
        409: {"description": "Conflict"},
        422: {"description": "Request payload is invalid"},
    },
)
def create_comment(
    payload: CreateCommentRequest,
    post_slug: str = Path(
        min_length=1, max_length=120, description="Post slug, e.g. `my-first-post`."
    ),
    service: CreateCommentService = Depends(get_create_comment_service),
) -> CommentResponse:
    comment = service.execute(
        post_slug=post_slug,
        user_name=payload.user_name,
        content=payload.content,
        email=str(payload.email) if payload.email is not None else None,
    )
    return CommentResponse.from_domain(comment)


@router.get(
    "/posts/{post_slug}/comments",
    response_model=ListCommentsResponse,
    summary="List Comments",
    description="List comments for a post, newest first, with cursor pagination.",
    responses={
        400: {"description": "Validation error"},
        422: {"description": "Request payload is invalid"},
    },
)
def list_comments(
    post_slug: str = Path(
        min_length=1, max_length=120, description="Post slug, e.g. `my-first-post`."
    ),
    limit: int | None = Query(
        default=None,
        ge=1,
        description="Max number of comments in a page. Defaults to configured limit.",
    ),
    cursor: str | None = Query(
        default=None, description="Opaque cursor returned from previous page."
    ),
    service: ListCommentsService = Depends(get_list_comments_service),
    settings: Settings = Depends(get_settings),
) -> ListCommentsResponse:
    page = service.execute(
        post_slug=post_slug,
        limit=limit or settings.default_list_limit,
        cursor=cursor,
    )
    return ListCommentsResponse(
        items=[CommentResponse.from_domain(item) for item in page.items],
        next_cursor=page.next_cursor,
    )


@router.get(
    "/posts/{post_slug}/comments/{comment_id}",
    response_model=CommentResponse,
    summary="Get Comment",
    description="Get a single comment by post slug and comment id.",
    responses={400: {"description": "Validation error"}, 404: {"description": "Not found"}},
)
def get_comment(
    post_slug: str = Path(
        min_length=1, max_length=120, description="Post slug, e.g. `my-first-post`."
    ),
    comment_id: str = Path(min_length=1, description="Comment ULID."),
    service: GetCommentService = Depends(get_get_comment_service),
) -> CommentResponse:
    comment = service.execute(post_slug=post_slug, comment_id=comment_id)
    return CommentResponse.from_domain(comment)


@router.patch(
    "/posts/{post_slug}/comments/{comment_id}",
    response_model=CommentResponse,
    summary="Update Comment",
    description="Update selected comment fields.",
    responses={
        400: {"description": "Validation error"},
        404: {"description": "Not found"},
        422: {"description": "Request payload is invalid"},
    },
)
def update_comment(
    payload: UpdateCommentRequest,
    post_slug: str = Path(
        min_length=1, max_length=120, description="Post slug, e.g. `my-first-post`."
    ),
    comment_id: str = Path(min_length=1, description="Comment ULID."),
    service: UpdateCommentService = Depends(get_update_comment_service),
) -> CommentResponse:
    patch = payload.model_dump(exclude_unset=True)
    comment = service.execute(post_slug=post_slug, comment_id=comment_id, patch=patch)
    return CommentResponse.from_domain(comment)


@router.delete(
    "/posts/{post_slug}/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Comment",
    description="Soft delete comment and set DynamoDB TTL expiration timestamp.",
    responses={400: {"description": "Validation error"}, 404: {"description": "Not found"}},
)
def delete_comment(
    post_slug: str = Path(
        min_length=1, max_length=120, description="Post slug, e.g. `my-first-post`."
    ),
    comment_id: str = Path(min_length=1, description="Comment ULID."),
    service: DeleteCommentService = Depends(get_delete_comment_service),
) -> Response:
    service.execute(post_slug=post_slug, comment_id=comment_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
