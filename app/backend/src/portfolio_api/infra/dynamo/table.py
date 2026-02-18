from __future__ import annotations

import base64
import json
from typing import Any

import boto3

from portfolio_api.domain.errors import DomainValidationError


def get_table(
    *,
    table_name: str,
    region_name: str,
    endpoint_url: str | None = None,
    aws_access_key_id: str | None = None,
    aws_secret_access_key: str | None = None,
):
    resource_kwargs: dict[str, str] = {"region_name": region_name}
    if endpoint_url:
        resource_kwargs["endpoint_url"] = endpoint_url
    if aws_access_key_id:
        resource_kwargs["aws_access_key_id"] = aws_access_key_id
    if aws_secret_access_key:
        resource_kwargs["aws_secret_access_key"] = aws_secret_access_key

    dynamodb = boto3.resource("dynamodb", **resource_kwargs)
    return dynamodb.Table(table_name)


def encode_cursor(last_evaluated_key: dict[str, Any] | None) -> str | None:
    if last_evaluated_key is None:
        return None
    raw = json.dumps(last_evaluated_key, separators=(",", ":")).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("utf-8")


def decode_cursor(cursor: str | None) -> dict[str, Any] | None:
    if cursor is None:
        return None
    try:
        decoded = base64.urlsafe_b64decode(cursor.encode("utf-8")).decode("utf-8")
        value = json.loads(decoded)
    except Exception as exc:  # noqa: BLE001
        raise DomainValidationError("cursor is invalid") from exc
    if not isinstance(value, dict):
        raise DomainValidationError("cursor is invalid")
    return value
