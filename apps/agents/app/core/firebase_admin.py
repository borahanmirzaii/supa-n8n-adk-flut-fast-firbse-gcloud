"""Firebase Admin SDK initialization."""

import os
import platform
from typing import Optional

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud import storage as gcs_storage
import structlog

from app.core.config import settings

logger = structlog.get_logger()

_firestore_client: Optional[firestore.Client] = None
_storage_client: Optional[gcs_storage.Client] = None


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
            # For emulator, create a mock credential
            # Firebase Admin SDK requires credentials even for emulator, but emulator doesn't validate them
            project_id = settings.GOOGLE_CLOUD_PROJECT or 'demo-project'
            
            # Create a minimal mock credential for emulator (emulator doesn't validate)
            # This is a workaround - emulator should work without real credentials
            mock_cred_data = {
                "type": "service_account",
                "project_id": project_id,
                "private_key_id": "mock-key-id",
                "private_key": "-----BEGIN PRIVATE KEY-----\nMOCK_KEY_FOR_EMULATOR\n-----END PRIVATE KEY-----\n",
                "client_email": f"mock@{project_id}.iam.gserviceaccount.com",
                "client_id": "123456789",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
            
            try:
                # Initialize with mock credential - emulator won't validate it
                mock_cred = credentials.Certificate(mock_cred_data)
                firebase_admin.initialize_app(
                    credential=mock_cred,
                    options={'projectId': project_id}
                )
            except Exception as init_error:
                # If mock credential fails, try without credential
                try:
                    firebase_admin.initialize_app(options={'projectId': project_id})
                except Exception:
                    # Last resort - just initialize with project ID
                    # Emulator should still work via FIRESTORE_EMULATOR_HOST
                    logger.warning("Firebase Admin init had issues, but emulator may still work", error=str(init_error))
            
            logger.info(
                "Firebase Admin initialized for emulator",
                emulator_host=firestore_emulator_host,
                platform=platform.system(),
                project_id=project_id
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
        # When FIRESTORE_EMULATOR_HOST is set, Firestore automatically uses the emulator
        # Even if credentials fail, emulator should work
        try:
            _firestore_client = firestore.client()
            logger.info("Firestore client initialized", emulator=is_emulator)
        except Exception as e:
            if is_emulator:
                # For emulator mode, credentials error is expected but emulator should still work
                # The error is logged but we continue - emulator doesn't validate credentials
                logger.warning(
                    "Firestore client credential check failed (expected for emulator)",
                    error=str(e),
                    emulator_host=os.getenv("FIRESTORE_EMULATOR_HOST")
                )
                # Try to create client anyway - emulator may still work
                try:
                    _firestore_client = firestore.client()
                    logger.info("Firestore client created for emulator (credentials ignored)")
                except Exception:
                    # If it still fails, log but don't crash - emulator operations may still work
                    logger.warning("Firestore client creation had issues, but emulator may still function")
                    # Set a None client - operations will fail but app won't crash on startup
                    _firestore_client = None
            else:
                logger.error("Failed to initialize Firestore client", error=str(e), exc_info=True)
                raise

        # Storage client (optional - only initialize if not emulator or if credentials available)
        if is_emulator:
            storage_emulator_host = os.getenv("FIREBASE_STORAGE_EMULATOR_HOST", "localhost:9199")
            logger.info(f"Using Storage emulator at {storage_emulator_host}")
            # For emulator, Storage client initialization is optional
            # Skip it if credentials are not available
            try:
                _storage_client = gcs_storage.Client(project=project_id)
                logger.info("Storage client initialized for emulator")
            except Exception as storage_error:
                logger.warning(
                    "Storage client initialization skipped for emulator (not critical)",
                    error=str(storage_error)
                )
                _storage_client = None
        else:
            _storage_client = gcs_storage.Client()
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


def get_storage_client() -> Optional[gcs_storage.Client]:
    """Get Storage client instance."""
    if _storage_client is None:
        initialize_firebase_admin()
    return _storage_client

