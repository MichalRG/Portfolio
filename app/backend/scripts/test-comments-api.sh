#!/usr/bin/env bash
set -euo pipefail

SLUG="my-first-post"
EXPECT_CAPTCHA_ENABLED=0
CAPTCHA_TOKEN=""

usage() {
  cat <<'EOF'
Usage:
  ./app/backend/scripts/test-comments-api.sh [options]

Options:
  --base-url <url>          API base URL
  --slug <slug>             Post slug (default: my-first-post)
  --expect-captcha-enabled  Expect captcha checks to be enabled
  --captcha-token <token>   Real captcha token (used for "valid create" in captcha mode)
  -h, --help                Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-url)
      BASE_URL="${2:-}"
      shift 2
      ;;
    --slug)
      SLUG="${2:-}"
      shift 2
      ;;
    --expect-captcha-enabled)
      EXPECT_CAPTCHA_ENABLED=1
      shift
      ;;
    --captcha-token)
      CAPTCHA_TOKEN="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

BASE_URL="${BASE_URL%/}"
COLLECTION_URL="$BASE_URL/api/v1/comments/$SLUG"
NOW_TAG="$(date +%Y%m%d%H%M%S)"
CREATED_COMMENT_ID=""

if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  PYTHON_BIN=""
fi

step() {
  printf '\n==> %s\n' "$1"
}

assert_status() {
  local actual="$1"
  local context="$2"
  shift 2
  local expected=("$@")
  local ok=1

  for code in "${expected[@]}"; do
    if [[ "$actual" == "$code" ]]; then
      ok=0
      break
    fi
  done

  if [[ $ok -ne 0 ]]; then
    echo "[$context] expected status: ${expected[*]}, got: $actual" >&2
    if [[ -n "${RESP_BODY:-}" ]]; then
      echo "Response body: $RESP_BODY" >&2
    fi
    exit 1
  fi
}

request_json() {
  local method="$1"
  local url="$2"
  local body="${3:-}"
  local headers_file body_file status

  headers_file="$(mktemp)"
  body_file="$(mktemp)"

  if [[ -n "$body" ]]; then
    printf 'curl -sS -X %s "%s" -H "Accept: application/json" -H "Content-Type: application/json" -H "Cache-Control: no-cache" --data %q\n' \
      "$method" "$url" "$body"
  else
    printf 'curl -sS -X %s "%s" -H "Accept: application/json" -H "Content-Type: application/json" -H "Cache-Control: no-cache"\n' \
      "$method" "$url"
  fi

  if [[ -n "$body" ]]; then
    if ! status="$(curl -sS -X "$method" "$url" \
      -H "Accept: application/json" \
      -H "Content-Type: application/json" \
      -H "Cache-Control: no-cache" \
      --data "$body" \
      -D "$headers_file" \
      -o "$body_file" \
      -w "%{http_code}")"; then
      echo "curl failed for $method $url" >&2
      rm -f "$headers_file" "$body_file"
      exit 1
    fi
  else
    if ! status="$(curl -sS -X "$method" "$url" \
      -H "Accept: application/json" \
      -H "Content-Type: application/json" \
      -H "Cache-Control: no-cache" \
      -D "$headers_file" \
      -o "$body_file" \
      -w "%{http_code}")"; then
      echo "curl failed for $method $url" >&2
      rm -f "$headers_file" "$body_file"
      exit 1
    fi
  fi

  RESP_STATUS="$status"
  RESP_BODY="$(cat "$body_file")"
  printf 'status=%s body=%s\n' "$RESP_STATUS" "$RESP_BODY"
  rm -f "$headers_file" "$body_file"
}

json_field() {
  local json="$1"
  local field="$2"

  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$json" | jq -r --arg field "$field" '.[$field] // empty'
    return 0
  fi

  if [[ -n "$PYTHON_BIN" ]]; then
    printf '%s' "$json" | "$PYTHON_BIN" -c '
import json, sys
field = sys.argv[1]
raw = sys.stdin.read()
try:
    data = json.loads(raw)
except Exception:
    print("")
    raise SystemExit(0)
value = data.get(field, "")
print("" if value is None else value)
' "$field"
    return 0
  fi

  echo ""
}

build_valid_payload() {
  local payload
  payload='{"user_name":"Smoke Tester","content":"Smoke test comment '"$NOW_TAG"'","email":"smoke@example.com","honeypot":""'
  if [[ "$EXPECT_CAPTCHA_ENABLED" -eq 1 && -n "$CAPTCHA_TOKEN" ]]; then
    payload+=',"captcha_token":"'"$CAPTCHA_TOKEN"'"'
  fi
  payload+='}'
  printf '%s' "$payload"
}

build_honeypot_payload() {
  local payload
  payload='{"user_name":"Spam Bot","content":"spam","honeypot":"bot-filled"'
  if [[ "$EXPECT_CAPTCHA_ENABLED" -eq 1 && -n "$CAPTCHA_TOKEN" ]]; then
    payload+=',"captcha_token":"'"$CAPTCHA_TOKEN"'"'
  fi
  payload+='}'
  printf '%s' "$payload"
}

echo "Comments API smoke test"
echo "Base URL: $BASE_URL"
echo "Slug: $SLUG"
echo "Captcha expected: $EXPECT_CAPTCHA_ENABLED"

step "GET list (expect 200)"
request_json "GET" "$COLLECTION_URL?limit=10"
assert_status "$RESP_STATUS" "List comments" 200
echo "OK: list returned 200"

step "POST valid comment"
request_json "POST" "$COLLECTION_URL" "$(build_valid_payload)"

if [[ "$EXPECT_CAPTCHA_ENABLED" -eq 1 && -z "$CAPTCHA_TOKEN" ]]; then
  assert_status "$RESP_STATUS" "Create without captcha token" 400
  echo "OK: create rejected without captcha token (400)"
else
  assert_status "$RESP_STATUS" "Create comment" 201
  CREATED_COMMENT_ID="$(json_field "$RESP_BODY" "id")"
  if [[ -z "$CREATED_COMMENT_ID" ]]; then
    echo "Create response missing id. Body: $RESP_BODY" >&2
    exit 1
  fi
  echo "OK: created comment id=$CREATED_COMMENT_ID"
fi

step "POST honeypot-filled payload (expect 400)"
request_json "POST" "$COLLECTION_URL" "$(build_honeypot_payload)"
assert_status "$RESP_STATUS" "Honeypot check" 400
echo "OK: honeypot rejected (400)"

if [[ "$EXPECT_CAPTCHA_ENABLED" -eq 1 ]]; then
  step "POST invalid captcha token (expect 400)"
  INVALID_CAPTCHA_PAYLOAD='{"user_name":"Captcha Test","content":"invalid token","honeypot":"","captcha_token":"invalid-token"}'
  request_json "POST" "$COLLECTION_URL" "$INVALID_CAPTCHA_PAYLOAD"
  assert_status "$RESP_STATUS" "Invalid captcha token" 400
  echo "OK: invalid captcha rejected (400)"
fi

if [[ -n "$CREATED_COMMENT_ID" ]]; then
  ITEM_URL="$COLLECTION_URL/$CREATED_COMMENT_ID"

  step "GET created comment (expect 200)"
  request_json "GET" "$ITEM_URL"
  assert_status "$RESP_STATUS" "Get created comment" 200
  echo "OK: get returned 200"

  step "PATCH comment (expect 200)"
  PATCH_PAYLOAD='{"content":"Updated smoke test comment '"$NOW_TAG"'"}'
  request_json "PATCH" "$ITEM_URL" "$PATCH_PAYLOAD"
  assert_status "$RESP_STATUS" "Patch comment" 200
  echo "OK: patch returned 200"

  step "DELETE comment (expect 204)"
  request_json "DELETE" "$ITEM_URL"
  assert_status "$RESP_STATUS" "Delete comment" 204
  echo "OK: delete returned 204"

  step "GET deleted comment (expect 404)"
  # Small retry window to tolerate brief propagation delays in deployed environments.
  deleted_status_ok=1
  for _ in 1 2 3 4 5; do
    request_json "GET" "$ITEM_URL?nocache=$(date +%s)"
    if [[ "$RESP_STATUS" == "404" ]]; then
      deleted_status_ok=0
      break
    fi
    sleep 1
  done
  if [[ "$deleted_status_ok" -ne 0 ]]; then
    assert_status "$RESP_STATUS" "Get deleted comment" 404
  fi
  echo "OK: deleted comment hidden (404)"
fi

echo
echo "Smoke test completed successfully."
