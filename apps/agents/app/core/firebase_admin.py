"""Firebase Admin SDK initialization."""

import os
import platform
from typing import Optional

import firebase_admin
from firebase_admin import credentials, firestore, storage
import structlog

from app.core.config import settings

logger = structlog.get_logger()

_firestore_client: Optional[firestore.Client] = None
_storage_client: Optional[storage.Client] = None


def get_emulator_host() -> str:
    """Get Firebase emulator host optimized for OrbStack."""
    emulator_host = os.getenv("FIRESTORE_EMULATOR_HOST")
    if emulator_host:
        return emulator_host
    
    # OrbStack provides better container-to-host networking
    if platform.system() == "Darwin":
        # OrbStack's host.orbstack.internal is more reliable than host.docker.internal
        return "host.orbstack.internal:8081"
    
    # Fallback to Docker Desktop or other platforms
    return "host.docker.internal:8081"


def initialize_firebase_admin() -> None:
    """Initialize Firebase Admin SDK."""
    global _firestore_client, _storage_client

    if firebase_admin._apps:  # type: ignore
        logger.info("Firebase Admin already initialized")
        return

    try:
        # Check if we're using emulators
        firestore_emulator_host = get_emulator_host()
        is_emulator = os.getenv("FIRESTORE_EMULATOR_HOST") is not None or "orbstack" in firestore_emulator_host.lower() or "docker.internal" in firestore_emulator_host.lower()
        
        # Set the emulator host if not already set
        if is_emulator and not os.getenv("FIRESTORE_EMULATOR_HOST"):
            os.environ["FIRESTORE_EMULATOR_HOST"] = firestore_emulator_host.split(":")[0] + ":8081"
            firestore_emulator_host = os.environ["FIRESTORE_EMULATOR_HOST"]

        if is_emulator:
            # For emulator, use default credentials (no real auth needed)
            firebase_admin.initialize_app()
            logger.info(
                "Firebase Admin initialized for emulator",
                emulator_host=firestore_emulator_host,
                platform=platform.system()
            )
        else:
            # Production: Use Application Default Credentials or service account
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
        # Note: Firestore emulator connection is handled via FIRESTORE_EMULATOR_HOST env var
        _firestore_client = firestore.client()
        logger.info("Firestore client initialized", emulator=is_emulator)

        # Storage client
        if is_emulator:
            storage_emulator_host = os.getenv("FIREBASE_STORAGE_EMULATOR_HOST", "localhost:9199")
            logger.info(f"Using Storage emulator at {storage_emulator_host}")
        
        _storage_client = storage.bucket()
        logger.info("Storage client initialized", emulator=is_emulator)

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

