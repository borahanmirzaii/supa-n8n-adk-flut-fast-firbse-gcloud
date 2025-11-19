"""Firebase Admin SDK initialization."""

import os
from typing import Optional

import firebase_admin
from firebase_admin import credentials, firestore, storage
import structlog

from app.core.config import settings

logger = structlog.get_logger()

_firestore_client: Optional[firestore.Client] = None
_storage_client: Optional[storage.Client] = None


def initialize_firebase_admin() -> None:
    """Initialize Firebase Admin SDK."""
    global _firestore_client, _storage_client

    if firebase_admin._apps:  # type: ignore
        logger.info("Firebase Admin already initialized")
        return

    try:
        # Use Application Default Credentials in production (Cloud Run)
        # Or service account key file in development
        if settings.GOOGLE_APPLICATION_CREDENTIALS:
            cred_path = settings.GOOGLE_APPLICATION_CREDENTIALS
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin initialized with service account")
            else:
                logger.warning("Service account file not found, using default credentials")
                firebase_admin.initialize_app()
        else:
            # Use Application Default Credentials
            firebase_admin.initialize_app()
            logger.info("Firebase Admin initialized with default credentials")

        # Initialize Firestore client
        _firestore_client = firestore.client()
        logger.info("Firestore client initialized")

        # Initialize Storage client
        _storage_client = storage.bucket()
        logger.info("Storage client initialized")

    except Exception as e:
        logger.error("Failed to initialize Firebase Admin", error=str(e), exc_info=True)
        raise


def get_firestore_client() -> firestore.Client:
    """Get Firestore client instance."""
    if _firestore_client is None:
        initialize_firebase_admin()
    assert _firestore_client is not None
    return _firestore_client


def get_storage_client() -> storage.Bucket:
    """Get Storage client instance."""
    if _storage_client is None:
        initialize_firebase_admin()
    assert _storage_client is not None
    return _storage_client

