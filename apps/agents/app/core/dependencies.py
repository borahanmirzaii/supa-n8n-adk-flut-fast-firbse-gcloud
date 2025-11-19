"""FastAPI dependency injection."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
import structlog

from app.core.firebase_admin import initialize_firebase_admin

logger = structlog.get_logger()

security = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> auth.UserRecord:
    """
    Dependency to get current authenticated user from Firebase token.

    Args:
        credentials: HTTP Bearer token credentials

    Returns:
        Firebase user record

    Raises:
        HTTPException: If authentication fails
    """
    try:
        # Initialize Firebase Admin if not already done
        initialize_firebase_admin()

        # Verify the Firebase ID token
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token["uid"]

        # Get user record
        user = auth.get_user(uid)
        logger.info("User authenticated", uid=uid)
        return user

    except Exception as e:
        logger.error("Authentication failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)]
) -> auth.UserRecord | None:
    """
    Dependency to optionally get current user (for endpoints that work with or without auth).

    Args:
        credentials: Optional HTTP Bearer token credentials

    Returns:
        Firebase user record or None
    """
    if credentials is None:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None

