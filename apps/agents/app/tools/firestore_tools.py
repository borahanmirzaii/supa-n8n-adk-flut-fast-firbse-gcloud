"""Firestore tools for agent operations."""

import structlog
from google.cloud import firestore
from app.core.config import settings

logger = structlog.get_logger()


class FirestoreTools:
    """Firestore operations for agents."""

    def __init__(self):
        """Initialize Firestore client."""
        self.db = firestore.Client(project=settings.GOOGLE_CLOUD_PROJECT)
        logger.info("Firestore client initialized")

    async def get_project(self, project_id: str) -> dict | None:
        """
        Get project by ID.

        Args:
            project_id: Project ID

        Returns:
            Project data or None
        """
        try:
            doc_ref = self.db.collection("projects").document(project_id)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error("Error getting project", project_id=project_id, error=str(e))
            raise

    async def create_project(self, project_data: dict) -> str:
        """
        Create a new project.

        Args:
            project_data: Project data

        Returns:
            Created project ID
        """
        try:
            doc_ref = self.db.collection("projects").document()
            doc_ref.set(project_data)
            logger.info("Project created", project_id=doc_ref.id)
            return doc_ref.id
        except Exception as e:
            logger.error("Error creating project", error=str(e))
            raise

    async def get_messages(self, session_id: str, limit: int = 50) -> list[dict]:
        """
        Get messages for a session.

        Args:
            session_id: Session ID
            limit: Maximum number of messages to retrieve

        Returns:
            List of messages
        """
        try:
            messages_ref = (
                self.db.collection("agents-sessions")
                .document(session_id)
                .collection("messages")
                .order_by("createdAt", direction=firestore.Query.DESCENDING)
                .limit(limit)
            )
            messages = messages_ref.stream()
            return [msg.to_dict() for msg in messages]
        except Exception as e:
            logger.error("Error getting messages", session_id=session_id, error=str(e))
            raise

