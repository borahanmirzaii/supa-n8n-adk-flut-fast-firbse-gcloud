"""FastAPI application entry point."""

import os
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

from app.core.config import settings
from app.core.logger import configure_logging
from app.agents.core_agent import core_agent

# Configure structured logging
configure_logging()
logger = structlog.get_logger()

# Initialize Sentry
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        integrations=[FastApiIntegration()],
        traces_sample_rate=1.0,
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info("Starting application")
    yield
    logger.info("Shutting down application")


app = FastAPI(
    title="AIP Agents API",
    description="FastAPI backend with Google ADK",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store agent in app state
app.state.agent = core_agent


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "AIP Agents API is running", "version": "0.1.0"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/run")
async def run_agent(payload: dict):
    """Run agent with given payload."""
    logger.info("Agent request received", payload=payload)
    agent = app.state.agent
    try:
        result = await agent.run(payload)
        logger.info("Agent request completed", result=result)
        return result
    except Exception as e:
        logger.error("Agent request failed", error=str(e), exc_info=True)
        raise


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8080))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.ENVIRONMENT == "development",
    )

