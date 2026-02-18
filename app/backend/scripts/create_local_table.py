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
    )


def ensure_comments_table() -> None:
    client, table_name = _build_client()
    try:
        client.describe_table(TableName=table_name)
        print(f"Table '{table_name}' already exists.")
    except ClientError as exc:
        error_code = exc.response.get("Error", {}).get("Code")
        if error_code != "ResourceNotFoundException":
            raise
        print(f"Creating table '{table_name}'...")
        client.create_table(
            TableName=table_name,
            KeySchema=[
                {"AttributeName": "PK", "KeyType": "HASH"},
                {"AttributeName": "SK", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "SK", "AttributeType": "S"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        waiter = client.get_waiter("table_exists")
        waiter.wait(TableName=table_name)
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
