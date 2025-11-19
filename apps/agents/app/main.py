"""FastAPI application entry point."""

import os
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logger import configure_logging
from app.core.firebase_admin import initialize_firebase_admin
from app.core.middleware import RequestLoggingMiddleware, ErrorHandlingMiddleware
from app.api.v1 import agents, chat
from app.core.exceptions import (
    AgentNotFoundError,
    SessionNotFoundError,
    ADKError,
    FirestoreError,
)

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

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info("Starting application")

    # Initialize Firebase Admin
    try:
        initialize_firebase_admin()
        logger.info("Firebase Admin initialized")
    except Exception as e:
        logger.error("Failed to initialize Firebase Admin", error=str(e))
        # Don't fail startup, but log the error

    yield
    logger.info("Shutting down application")


app = FastAPI(
    title="AIP Agents API",
    description="FastAPI backend with Google ADK - Production-ready agent API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(ErrorHandlingMiddleware)

# Set rate limiter in routers
agents.set_limiter(limiter)
chat.set_limiter(limiter)

# Include routers
app.include_router(agents.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")

# Exception handlers
@app.exception_handler(AgentNotFoundError)
async def agent_not_found_handler(request: Request, exc: AgentNotFoundError):
    """Handle agent not found errors."""
    logger.warning("Agent not found", path=request.url.path)
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc)},
    )


@app.exception_handler(SessionNotFoundError)
async def session_not_found_handler(request: Request, exc: SessionNotFoundError):
    """Handle session not found errors."""
    logger.warning("Session not found", path=request.url.path)
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc)},
    )


@app.exception_handler(ADKError)
async def adk_error_handler(request: Request, exc: ADKError):
    """Handle ADK errors."""
    logger.error("ADK error", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Agent service error"},
    )


@app.exception_handler(FirestoreError)
async def firestore_error_handler(request: Request, exc: FirestoreError):
    """Handle Firestore errors."""
    logger.error("Firestore error", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Database error"},
    )


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "AIP Agents API is running",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
    }


# Legacy endpoint for backward compatibility
@app.post("/run")
@limiter.limit("10/minute")
async def run_agent(request: Request, payload: dict):
    """
    Run agent with given payload (legacy endpoint).

    Args:
        request: FastAPI request
        payload: Request payload

    Returns:
        Agent response
    """
    logger.info("Legacy agent request received", payload=payload)
    try:
        from app.services.adk_service import ADKService

        adk_service = ADKService()
        result = await adk_service.run_agent(
            message=payload.get("message", ""),
            session_id=payload.get("sessionId"),
            context=payload.get("context"),
        )
        logger.info("Legacy agent request completed", result=result)
        return result
    except Exception as e:
        logger.error("Legacy agent request failed", error=str(e), exc_info=True)
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

