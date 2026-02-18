# Portfolio API

FastAPI backend for the portfolio project (currently with comments module) with layered architecture:

- `domain/`: business entities and invariants
- `application/`: services and repository ports
- `infra/`: DynamoDB implementation
- `http/`: DTOs, routes, middleware, error mapping
- `container.py`: `punq` composition root for wiring settings/repositories/services

## Local Setup (Host App + Docker DynamoDB)

```bash
uv sync --extra dev
docker compose up -d dynamodb-local
uv run python scripts/create_local_table.py
uv run uvicorn portfolio_api.main:app --reload
```

Swagger UI:
- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8000/redoc`

If you need to stop local DynamoDB:

```bash
docker compose down
```

## Local Setup (All In Docker)

```bash
docker compose up --build backend
```

This starts both services:
- `dynamodb-local` (port `8000`, in-memory mode)
- `backend` (port `8080`)

The backend container automatically:
1. waits for DynamoDB availability
2. creates the comments table if missing
3. starts the API server

Swagger in all-docker mode:
- `http://127.0.0.1:8080/docs`

If startup looks stuck, reset containers and rebuild:

```bash
docker compose down --remove-orphans
docker compose up --build backend
```

## Tests

```bash
uv run pytest
```

## Environment variables

- `PORTFOLIO_API_APP_NAME`
- `PORTFOLIO_API_APP_VERSION`
- `PORTFOLIO_API_COMMENTS_TABLE_NAME`
- `PORTFOLIO_API_AWS_REGION`
- `PORTFOLIO_API_DYNAMODB_ENDPOINT_URL`
- `PORTFOLIO_API_AWS_ACCESS_KEY_ID`
- `PORTFOLIO_API_AWS_SECRET_ACCESS_KEY`
- `PORTFOLIO_API_TTL_RETENTION_DAYS`
- `PORTFOLIO_API_DEFAULT_LIST_LIMIT`
- `PORTFOLIO_API_MAX_LIST_LIMIT`
- `PORTFOLIO_API_LOG_LEVEL`
