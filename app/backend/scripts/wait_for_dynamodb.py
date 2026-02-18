from __future__ import annotations

import time

import boto3
from botocore.config import Config

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
    return boto3.client(
        "dynamodb",
        config=Config(connect_timeout=1, read_timeout=1, retries={"max_attempts": 0}),
        **client_kwargs,
    )


def wait_for_dynamodb(max_attempts: int = 60, delay_seconds: float = 1.0) -> None:
    client = _build_client()
    for attempt in range(1, max_attempts + 1):
        print(f"Checking DynamoDB readiness ({attempt}/{max_attempts})...")
        try:
            client.list_tables(Limit=1)
            print("DynamoDB is ready.")
            return
        except Exception as exc:  # noqa: BLE001
            print(f"Waiting for DynamoDB ({attempt}/{max_attempts}): {exc}")
            time.sleep(delay_seconds)
    raise RuntimeError("DynamoDB did not become ready in time.")


if __name__ == "__main__":
    wait_for_dynamodb()
