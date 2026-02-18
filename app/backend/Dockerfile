FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock README.md ./
COPY src ./src
COPY scripts ./scripts

RUN uv sync --frozen

EXPOSE 8080

CMD ["uv", "run", "uvicorn", "portfolio_api.main:app", "--host", "0.0.0.0", "--port", "8080"]
