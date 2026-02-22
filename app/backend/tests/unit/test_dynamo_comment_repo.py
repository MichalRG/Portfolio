from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from boto3.dynamodb.conditions import AttributeBase, ConditionBase
from botocore.exceptions import ClientError

from portfolio_api.domain.comment import Comment
from portfolio_api.infra.dynamo.comment_repo import DynamoCommentRepository

FIXED_NOW = datetime(2026, 1, 1, tzinfo=timezone.utc)
COMMENT_ID = "01JZ4Y2V9D3MQ8G7RKTY6XP0A1"
POST_SLUG = "my-post"


def _conditional_check_failed() -> ClientError:
    return ClientError(
        {
            "Error": {
                "Code": "ConditionalCheckFailedException",
                "Message": "Condition check failed",
            }
        },
        "UpdateItem",
    )


def _evaluate_condition(condition: ConditionBase, item: dict[str, Any]) -> bool:
    expression = condition.get_expression()
    operator = expression["operator"]
    values = expression["values"]

    if operator == "AND":
        left, right = values
        return _evaluate_condition(left, item) and _evaluate_condition(right, item)

    attr = values[0]
    if not isinstance(attr, AttributeBase):
        raise AssertionError("Unsupported condition attribute")
    if operator == "attribute_exists":
        return attr.name in item
    if operator == "attribute_not_exists":
        return attr.name not in item
    raise AssertionError(f"Unsupported operator: {operator}")


class FakeDynamoTable:
    def __init__(self) -> None:
        self._items: dict[tuple[str, str], dict[str, Any]] = {}
        self.remove_before_update = False

    def seed(self, item: dict[str, Any]) -> None:
        key = (item["post_slug"], item["comment_id"])
        self._items[key] = dict(item)

    def get_item(self, *, Key: dict[str, str], **_: Any) -> dict[str, Any]:
        item = self._items.get((Key["post_slug"], Key["comment_id"]))
        if item is None:
            return {}
        return {"Item": dict(item)}

    def update_item(self, **kwargs: Any) -> dict[str, Any]:
        key = (kwargs["Key"]["post_slug"], kwargs["Key"]["comment_id"])
        if self.remove_before_update:
            self._items.pop(key, None)
            self.remove_before_update = False

        current = self._items.get(key)
        condition = kwargs.get("ConditionExpression")
        if condition is not None and not _evaluate_condition(condition, current or {}):
            raise _conditional_check_failed()

        attrs = (
            dict(current)
            if current is not None
            else {"post_slug": key[0], "comment_id": key[1]}
        )
        self._apply_update_expression(
            attrs=attrs,
            update_expression=kwargs["UpdateExpression"],
            names=kwargs.get("ExpressionAttributeNames", {}),
            values=kwargs.get("ExpressionAttributeValues", {}),
        )
        self._items[key] = attrs

        if kwargs.get("ReturnValues") == "ALL_NEW":
            return {"Attributes": dict(attrs)}
        return {}

    @staticmethod
    def _apply_update_expression(
        *,
        attrs: dict[str, Any],
        update_expression: str,
        names: dict[str, str],
        values: dict[str, Any],
    ) -> None:
        expression = update_expression.strip()
        set_section = ""
        remove_section = ""

        if expression.startswith("SET "):
            expression = expression[4:]
            if " REMOVE " in expression:
                set_section, remove_section = expression.split(" REMOVE ", 1)
            else:
                set_section = expression
        elif expression.startswith("REMOVE "):
            remove_section = expression[7:]

        if set_section:
            for assignment in set_section.split(","):
                lhs, rhs = [part.strip() for part in assignment.split("=", 1)]
                field = names.get(lhs, lhs.lstrip("#"))
                attrs[field] = values[rhs]

        if remove_section:
            for alias in remove_section.split(","):
                token = alias.strip()
                if not token:
                    continue
                field = names.get(token, token.lstrip("#"))
                attrs.pop(field, None)


def _make_comment() -> Comment:
    return Comment.create(
        comment_id=COMMENT_ID,
        post_slug=POST_SLUG,
        user_name="Jane Doe",
        content="Hello",
        email="jane@example.com",
        now=FIXED_NOW,
    )


def test_update_returns_none_when_item_deleted_between_read_and_write() -> None:
    table = FakeDynamoTable()
    repo = DynamoCommentRepository(table)
    table.seed(repo._to_dynamo_item(_make_comment()))  # noqa: SLF001
    table.remove_before_update = True

    updated = repo.update(
        POST_SLUG,
        COMMENT_ID,
        {"content": "Updated", "updated_at": FIXED_NOW},
    )

    assert updated is None


def test_soft_delete_returns_false_without_creating_tombstone_for_missing_item() -> None:
    table = FakeDynamoTable()
    repo = DynamoCommentRepository(table)

    deleted = repo.soft_delete(
        POST_SLUG,
        COMMENT_ID,
        deleted_at=FIXED_NOW,
        updated_at=FIXED_NOW,
        expires_at=123,
    )

    assert deleted is False
    assert table._items == {}  # noqa: SLF001
