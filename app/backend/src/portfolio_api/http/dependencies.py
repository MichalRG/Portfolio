from __future__ import annotations

from fastapi import Request
import punq

from portfolio_api.application.ports.comment_repo import CommentRepository
from portfolio_api.application.services.comments.create_comment import CreateCommentService
from portfolio_api.application.services.comments.delete_comment import DeleteCommentService
from portfolio_api.application.services.comments.get_comment import GetCommentService
from portfolio_api.application.services.comments.list_comments import ListCommentsService
from portfolio_api.application.services.comments.update_comment import UpdateCommentService
from portfolio_api.config import Settings


def get_container(request: Request) -> punq.Container:
    return request.app.state.container


def get_settings(request: Request) -> Settings:
    return get_container(request).resolve(Settings)


def get_comment_repo(request: Request) -> CommentRepository:
    return get_container(request).resolve(CommentRepository)


def get_create_comment_service(request: Request) -> CreateCommentService:
    return get_container(request).resolve(CreateCommentService)


def get_list_comments_service(request: Request) -> ListCommentsService:
    return get_container(request).resolve(ListCommentsService)


def get_get_comment_service(request: Request) -> GetCommentService:
    return get_container(request).resolve(GetCommentService)


def get_update_comment_service(request: Request) -> UpdateCommentService:
    return get_container(request).resolve(UpdateCommentService)


def get_delete_comment_service(request: Request) -> DeleteCommentService:
    return get_container(request).resolve(DeleteCommentService)
