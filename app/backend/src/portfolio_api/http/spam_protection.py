from __future__ import annotations

import json
from urllib import parse, request

from fastapi import HTTPException, status

from portfolio_api.config import Settings


def validate_comment_submission(
    *,
    settings: Settings,
    honeypot: str | None,
    captcha_token: str | None,
    client_ip: str | None,
) -> None:
    if honeypot is not None and honeypot.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request rejected.",
        )

    captcha_required = settings.comments_require_captcha or bool(
        settings.turnstile_secret_key
    )
    if not captcha_required:
        return

    if not settings.turnstile_secret_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Captcha is required but not configured.",
        )

    if captcha_token is None or not captcha_token.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="captcha_token is required.",
        )

    if not _verify_turnstile(
        verify_url=settings.turnstile_verify_url,
        secret_key=settings.turnstile_secret_key,
        token=captcha_token.strip(),
        remote_ip=client_ip,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Captcha verification failed.",
        )


def _verify_turnstile(
    *,
    verify_url: str,
    secret_key: str,
    token: str,
    remote_ip: str | None,
) -> bool:
    payload: dict[str, str] = {
        "secret": secret_key,
        "response": token,
    }
    if remote_ip:
        payload["remoteip"] = remote_ip

    encoded_body = parse.urlencode(payload).encode("utf-8")
    http_request = request.Request(
        verify_url,
        data=encoded_body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    try:
        with request.urlopen(http_request, timeout=2.0) as response:
            data = json.loads(response.read().decode("utf-8"))
    except Exception:  # noqa: BLE001
        return False

    return bool(data.get("success") is True)
