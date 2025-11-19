"""Custom middleware for FastAPI."""

import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import structlog

logger = structlog.get_logger()


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging all requests."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Log request and response."""
        start_time = time.time()

        # Log request
        logger.info(
            "Request received",
            method=request.method,
            path=request.url.path,
            client_ip=request.client.host if request.client else None,
        )

        # Process request
        try:
            response = await call_next(request)
            process_time = time.time() - start_time

            # Log response
            logger.info(
                "Request completed",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                process_time=f"{process_time:.3f}s",
            )

            # Add process time header
            response.headers["X-Process-Time"] = str(process_time)

            return response

        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                "Request failed",
                method=request.method,
                path=request.url.path,
                error=str(e),
                process_time=f"{process_time:.3f}s",
                exc_info=True,
            )
            raise


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware for handling errors."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Handle errors."""
        try:
            return await call_next(request)
        except Exception as e:
            logger.error(
                "Unhandled exception",
                method=request.method,
                path=request.url.path,
                error=str(e),
                exc_info=True,
            )
            # Re-raise to let FastAPI handle it
            raise

