# Multi-stage Dockerfile for Cloud Run with uv
FROM python:3.11-slim AS base

ENV UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Install uv
RUN pip install --no-cache-dir uv

WORKDIR /app

# Copy project files
COPY apps/agents/pyproject.toml apps/agents/uv.lock ./
RUN uv sync --frozen --no-dev

# Copy application code
COPY apps/agents/app ./app

# Production stage
FROM python:3.11-slim AS production

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Copy virtual environment from base
COPY --from=base /app/.venv /app/.venv

# Copy application code
COPY apps/agents/app ./app

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]

