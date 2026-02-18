from __future__ import annotations

import punq

from portfolio_api.application.ports.comment_repo import CommentRepository
from portfolio_api.application.services.comments.create_comment import CreateCommentService
from portfolio_api.application.services.comments.delete_comment import DeleteCommentService
from portfolio_api.application.services.comments.get_comment import GetCommentService
from portfolio_api.application.services.comments.list_comments import ListCommentsService
from portfolio_api.application.services.comments.update_comment import UpdateCommentService
from portfolio_api.config import Settings
from portfolio_api.infra.dynamo.comment_repo import DynamoCommentRepository
from portfolio_api.infra.dynamo.table import get_table


def build_container(
    *, settings: Settings, comment_repo: CommentRepository | None = None
) -> punq.Container:
    container = punq.Container()

    repo = comment_repo
    if repo is None:
        table = get_table(
            table_name=settings.comments_table_name,
            region_name=settings.aws_region,
            endpoint_url=settings.dynamodb_endpoint_url,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )
        repo = DynamoCommentRepository(table=table)

    container.register(Settings, instance=settings)
    container.register(CommentRepository, instance=repo)
    container.register(CreateCommentService, instance=CreateCommentService(repo=repo))
    container.register(
        ListCommentsService,
        instance=ListCommentsService(repo=repo, max_limit=settings.max_list_limit),
    )
    container.register(GetCommentService, instance=GetCommentService(repo=repo))
    container.register(UpdateCommentService, instance=UpdateCommentService(repo=repo))
    container.register(
        DeleteCommentService,
        instance=DeleteCommentService(
            repo=repo, ttl_retention_days=settings.ttl_retention_days
        ),
    )
    return container
