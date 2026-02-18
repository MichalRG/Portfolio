from __future__ import annotations

from datetime import datetime
from typing import Any

from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from portfolio_api.application.ports.comment_repo import (
    CommentPatch,
    CommentRepository,
    ListCommentsResult,
)
from portfolio_api.domain.comment import Comment
from portfolio_api.domain.errors import Conflict
from portfolio_api.infra.dynamo.table import (
    decode_cursor,
    encode_cursor,
)


class DynamoCommentRepository(CommentRepository):
    def __init__(self, table: Any):
        self._table = table

    def create(self, comment: Comment) -> Comment:
        item = self._to_dynamo_item(comment)
        try:
            self._table.put_item(
                Item=item,
                ConditionExpression="attribute_not_exists(PK) AND attribute_not_exists(SK)",
            )
        except ClientError as exc:
            error_code = exc.response.get("Error", {}).get("Code")
            if error_code == "ConditionalCheckFailedException":
                raise Conflict(
                    f"Comment '{comment.comment_id}' already exists in post '{comment.post_slug}'"
                ) from exc
            raise
        return comment

    def list_by_post_slug(
        self, slug: str, limit: int, cursor: str | None
    ) -> ListCommentsResult:
        query_params: dict[str, Any] = {
            "KeyConditionExpression": Key("PK").eq(slug),
            "FilterExpression": Attr("deleted_at").not_exists(),
            "Limit": limit,
            "ScanIndexForward": False,
        }
        decoded_cursor = decode_cursor(cursor)
        if decoded_cursor is not None:
            query_params["ExclusiveStartKey"] = decoded_cursor

        response = self._table.query(**query_params)
        items = [self._from_dynamo_item(item) for item in response.get("Items", [])]
        next_cursor = encode_cursor(response.get("LastEvaluatedKey"))
        return ListCommentsResult(items=items, next_cursor=next_cursor)

    def get_by_id(self, post_slug: str, comment_id: str) -> Comment | None:
        response = self._table.get_item(Key={"PK": post_slug, "SK": comment_id})
        item = response.get("Item")
        if item is None or item.get("deleted_at"):
            return None
        return self._from_dynamo_item(item)

    def update(
        self, post_slug: str, comment_id: str, patch: CommentPatch
    ) -> Comment | None:
        if self.get_by_id(post_slug, comment_id) is None:
            return None

        set_parts: list[str] = []
        remove_parts: list[str] = []
        names: dict[str, str] = {}
        values: dict[str, Any] = {}

        for field_name, field_value in patch.items():
            alias = f"#{field_name}"
            names[alias] = field_name
            if field_name == "email" and field_value is None:
                remove_parts.append(alias)
                continue

            set_parts.append(f"{alias} = :{field_name}")
            if isinstance(field_value, datetime):
                values[f":{field_name}"] = self._serialize_datetime(field_value)
            else:
                values[f":{field_name}"] = field_value

        if not set_parts and not remove_parts:
            return self.get_by_id(post_slug, comment_id)

        clauses: list[str] = []
        if set_parts:
            clauses.append("SET " + ", ".join(set_parts))
        if remove_parts:
            clauses.append("REMOVE " + ", ".join(remove_parts))
        update_expression = " ".join(clauses)

        update_kwargs: dict[str, Any] = {
            "Key": {"PK": post_slug, "SK": comment_id},
            "UpdateExpression": update_expression,
            "ExpressionAttributeNames": names,
            "ReturnValues": "ALL_NEW",
            "ConditionExpression": Attr("deleted_at").not_exists(),
        }
        if values:
            update_kwargs["ExpressionAttributeValues"] = values

        try:
            response = self._table.update_item(**update_kwargs)
        except ClientError as exc:
            error_code = exc.response.get("Error", {}).get("Code")
            if error_code == "ConditionalCheckFailedException":
                return None
            raise
        attrs = response.get("Attributes")
        if attrs is None:
            return None
        return self._from_dynamo_item(attrs)

    def soft_delete(
        self,
        post_slug: str,
        comment_id: str,
        *,
        deleted_at: datetime,
        updated_at: datetime,
        expires_at: int,
    ) -> bool:
        try:
            self._table.update_item(
                Key={"PK": post_slug, "SK": comment_id},
                UpdateExpression=(
                    "SET deleted_at = :deleted_at, updated_at = :updated_at, "
                    "expires_at = :expires_at"
                ),
                ExpressionAttributeValues={
                    ":deleted_at": self._serialize_datetime(deleted_at),
                    ":updated_at": self._serialize_datetime(updated_at),
                    ":expires_at": expires_at,
                },
                ConditionExpression=Attr("deleted_at").not_exists(),
            )
        except ClientError as exc:
            error_code = exc.response.get("Error", {}).get("Code")
            if error_code == "ConditionalCheckFailedException":
                return False
            raise
        return True

    def ping(self) -> None:
        self._table.load()

    @staticmethod
    def _serialize_datetime(value: datetime) -> str:
        return value.isoformat()

    @staticmethod
    def _parse_datetime(value: str) -> datetime:
        return datetime.fromisoformat(value)

    def _to_dynamo_item(self, comment: Comment) -> dict[str, Any]:
        item: dict[str, Any] = {
            "PK": comment.post_slug,
            "SK": comment.comment_id,
            "comment_id": comment.comment_id,
            "post_slug": comment.post_slug,
            "user_name": comment.user_name,
            "content": comment.content,
            "created_at": self._serialize_datetime(comment.created_at),
            "updated_at": self._serialize_datetime(comment.updated_at),
        }
        if comment.email is not None:
            item["email"] = comment.email
        if comment.deleted_at is not None:
            item["deleted_at"] = self._serialize_datetime(comment.deleted_at)
        if comment.expires_at is not None:
            item["expires_at"] = comment.expires_at
        return item

    def _from_dynamo_item(self, item: dict[str, Any]) -> Comment:
        return Comment(
            comment_id=item["comment_id"],
            post_slug=item["post_slug"],
            user_name=item["user_name"],
            content=item["content"],
            email=item.get("email"),
            created_at=self._parse_datetime(item["created_at"]),
            updated_at=self._parse_datetime(item["updated_at"]),
            deleted_at=self._parse_datetime(item["deleted_at"])
            if item.get("deleted_at")
            else None,
            expires_at=int(item["expires_at"])
            if item.get("expires_at") is not None
            else None,
        )
