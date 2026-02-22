from __future__ import annotations

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from portfolio_api.config import get_settings


def _build_client():
    settings = get_settings()
    client_kwargs: dict[str, str] = {"region_name": settings.aws_region}
    if settings.dynamodb_endpoint_url:
        client_kwargs["endpoint_url"] = settings.dynamodb_endpoint_url
    if settings.aws_access_key_id:
        client_kwargs["aws_access_key_id"] = settings.aws_access_key_id
    if settings.aws_secret_access_key:
        client_kwargs["aws_secret_access_key"] = settings.aws_secret_access_key
    return (
        boto3.client(
            "dynamodb",
            config=Config(
                connect_timeout=1, read_timeout=1, retries={"max_attempts": 0}
            ),
            **client_kwargs,
        ),
        settings.comments_table_name,
        settings.dynamodb_endpoint_url,
    )


def _create_comments_table(client, table_name: str) -> None:
    client.create_table(
        TableName=table_name,
        KeySchema=[
            {"AttributeName": "post_slug", "KeyType": "HASH"},
            {"AttributeName": "comment_id", "KeyType": "RANGE"},
        ],
        AttributeDefinitions=[
            {"AttributeName": "post_slug", "AttributeType": "S"},
            {"AttributeName": "comment_id", "AttributeType": "S"},
        ],
        BillingMode="PAY_PER_REQUEST",
    )
    waiter = client.get_waiter("table_exists")
    waiter.wait(TableName=table_name)


def _table_schema_matches(table_desc: dict) -> bool:
    key_schema = table_desc.get("KeySchema", [])
    key_by_type = {entry.get("KeyType"): entry.get("AttributeName") for entry in key_schema}
    return (
        key_by_type.get("HASH") == "post_slug"
        and key_by_type.get("RANGE") == "comment_id"
    )


def _is_local_endpoint(endpoint_url: str | None) -> bool:
    if endpoint_url is None:
        return False
    endpoint = endpoint_url.lower()
    return (
        "localhost" in endpoint
        or "127.0.0.1" in endpoint
        or "dynamodb-local" in endpoint
    )


def ensure_comments_table() -> None:
    client, table_name, endpoint_url = _build_client()
    try:
        desc = client.describe_table(TableName=table_name).get("Table", {})
        print(f"Table '{table_name}' already exists.")

        if not _table_schema_matches(desc):
            if not _is_local_endpoint(endpoint_url):
                raise RuntimeError(
                    "Existing table key schema does not match required schema "
                    "(post_slug/comment_id). Refusing to recreate non-local table."
                )

            print(
                "Existing table schema is outdated; recreating local table "
                f"'{table_name}' with keys post_slug/comment_id..."
            )
            client.delete_table(TableName=table_name)
            delete_waiter = client.get_waiter("table_not_exists")
            delete_waiter.wait(TableName=table_name)
            _create_comments_table(client, table_name)
            print(f"Table '{table_name}' recreated.")
    except ClientError as exc:
        error_code = exc.response.get("Error", {}).get("Code")
        if error_code != "ResourceNotFoundException":
            raise
        print(f"Creating table '{table_name}'...")
        _create_comments_table(client, table_name)
        print(f"Table '{table_name}' created.")

    ttl = client.describe_time_to_live(TableName=table_name)
    ttl_status = ttl.get("TimeToLiveDescription", {}).get("TimeToLiveStatus", "DISABLED")
    if ttl_status != "ENABLED":
        client.update_time_to_live(
            TableName=table_name,
            TimeToLiveSpecification={
                "Enabled": True,
                "AttributeName": "expires_at",
            },
        )
        print("TTL enabled on attribute 'expires_at'.")


if __name__ == "__main__":
    ensure_comments_table()
