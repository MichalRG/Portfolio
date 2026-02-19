from __future__ import annotations

import base64
import json

import pytest

from portfolio_api.domain.errors import DomainValidationError
from portfolio_api.infra.dynamo.table import decode_cursor


def _encode_cursor_payload(payload: object) -> str:
    raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("utf-8")


def test_decode_cursor_accepts_expected_key_shape() -> None:
    cursor = _encode_cursor_payload({"PK": "my-post", "SK": "01JZ4Y2V9D3MQ8G7RKTY6XP0A1"})

    decoded = decode_cursor(cursor)

    assert decoded == {"PK": "my-post", "SK": "01JZ4Y2V9D3MQ8G7RKTY6XP0A1"}


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"PK": "my-post"},
        {"SK": "01JZ4Y2V9D3MQ8G7RKTY6XP0A1"},
        {"PK": "", "SK": "01JZ4Y2V9D3MQ8G7RKTY6XP0A1"},
        {"PK": "my-post", "SK": ""},
        {"PK": 123, "SK": "01JZ4Y2V9D3MQ8G7RKTY6XP0A1"},
        {"PK": "my-post", "SK": 123},
    ],
)
def test_decode_cursor_rejects_invalid_key_shape(payload: object) -> None:
    cursor = _encode_cursor_payload(payload)

    with pytest.raises(DomainValidationError):
        decode_cursor(cursor)
