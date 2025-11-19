"""Agent service for business logic."""

from datetime import datetime
from typing import Optional, List
import uuid

from google.cloud import firestore
import structlog

from app.core.firebase_admin import get_firestore_client
from app.models.agent import AgentCreate, AgentUpdate, AgentResponse, AgentStatus
from app.core.exceptions import AgentNotFoundError, FirestoreError

logger = structlog.get_logger()


class AgentService:
    """Service for agent operations."""

    def __init__(self) -> None:
        """Initialize agent service."""
        self.db = get_firestore_client()
        self.collection = "agents"

    async def create_agent(
        self, agent_data: AgentCreate, user_id: str
    ) -> AgentResponse:
        """
        Create a new agent.

        Args:
            agent_data: Agent creation data
            user_id: User ID creating the agent

        Returns:
            Created agent response
        """
        try:
            agent_id = str(uuid.uuid4())
            now = datetime.utcnow()

            agent_doc = {
                "id": agent_id,
                "config": agent_data.config.model_dump(),
                "status": agent_data.status.value,
                "created_at": now,
                "updated_at": now,
                "created_by": user_id,
            }

            doc_ref = self.db.collection(self.collection).document(agent_id)
            doc_ref.set(agent_doc)

            logger.info("Agent created", agent_id=agent_id, user_id=user_id)

            return AgentResponse(
                id=agent_id,
                config=agent_data.config,
                status=agent_data.status,
                created_at=now,
                updated_at=now,
                created_by=user_id,
            )

        except Exception as e:
            logger.error("Failed to create agent", error=str(e), exc_info=True)
            raise FirestoreError(f"Failed to create agent: {str(e)}") from e

    async def get_agent(self, agent_id: str) -> AgentResponse:
        """
        Get agent by ID.

        Args:
            agent_id: Agent ID

        Returns:
            Agent response

        Raises:
            AgentNotFoundError: If agent not found
        """
        try:
            doc_ref = self.db.collection(self.collection).document(agent_id)
            doc = doc_ref.get()

            if not doc.exists:
                raise AgentNotFoundError(f"Agent {agent_id} not found")

            data = doc.to_dict()
            assert data is not None

            from app.models.agent import AgentConfig

            return AgentResponse(
                id=data["id"],
                config=AgentConfig(**data["config"]),
                status=AgentStatus(data["status"]),
                created_at=data["created_at"],
                updated_at=data["updated_at"],
                created_by=data["created_by"],
            )

        except AgentNotFoundError:
            raise
        except Exception as e:
            logger.error("Failed to get agent", error=str(e), agent_id=agent_id)
            raise FirestoreError(f"Failed to get agent: {str(e)}") from e

    async def list_agents(
        self,
        user_id: Optional[str] = None,
        status: Optional[AgentStatus] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[AgentResponse]:
        """
        List agents with optional filtering.

        Args:
            user_id: Filter by user ID
            status: Filter by status
            limit: Maximum number of results
            offset: Offset for pagination

        Returns:
            List of agent responses
        """
        try:
            query: firestore.Query = self.db.collection(self.collection)

            if user_id:
                query = query.where("created_by", "==", user_id)

            if status:
                query = query.where("status", "==", status.value)

            query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
            query = query.limit(limit).offset(offset)

            docs = query.stream()

            agents = []
            for doc in docs:
                data = doc.to_dict()
                if data:
                    from app.models.agent import AgentConfig

                    agents.append(
                        AgentResponse(
                            id=data["id"],
                            config=AgentConfig(**data["config"]),
                            status=AgentStatus(data["status"]),
                            created_at=data["created_at"],
                            updated_at=data["updated_at"],
                            created_by=data["created_by"],
                        )
                    )

            logger.info("Agents listed", count=len(agents), user_id=user_id)
            return agents

        except Exception as e:
            logger.error("Failed to list agents", error=str(e))
            raise FirestoreError(f"Failed to list agents: {str(e)}") from e

    async def update_agent(
        self, agent_id: str, agent_data: AgentUpdate, user_id: str
    ) -> AgentResponse:
        """
        Update an agent.

        Args:
            agent_id: Agent ID
            agent_data: Agent update data
            user_id: User ID updating the agent

        Returns:
            Updated agent response

        Raises:
            AgentNotFoundError: If agent not found
        """
        try:
            doc_ref = self.db.collection(self.collection).document(agent_id)
            doc = doc_ref.get()

            if not doc.exists:
                raise AgentNotFoundError(f"Agent {agent_id} not found")

            update_data: dict = {"updated_at": datetime.utcnow()}

            if agent_data.config:
                update_data["config"] = agent_data.config.model_dump()

            if agent_data.status:
                update_data["status"] = agent_data.status.value

            doc_ref.update(update_data)

            logger.info("Agent updated", agent_id=agent_id, user_id=user_id)

            return await self.get_agent(agent_id)

        except AgentNotFoundError:
            raise
        except Exception as e:
            logger.error("Failed to update agent", error=str(e), agent_id=agent_id)
            raise FirestoreError(f"Failed to update agent: {str(e)}") from e

    async def delete_agent(self, agent_id: str, user_id: str) -> None:
        """
        Delete an agent.

        Args:
            agent_id: Agent ID
            user_id: User ID deleting the agent

        Raises:
            AgentNotFoundError: If agent not found
        """
        try:
            doc_ref = self.db.collection(self.collection).document(agent_id)
            doc = doc_ref.get()

            if not doc.exists:
                raise AgentNotFoundError(f"Agent {agent_id} not found")

            doc_ref.delete()

            logger.info("Agent deleted", agent_id=agent_id, user_id=user_id)

        except AgentNotFoundError:
            raise
        except Exception as e:
            logger.error("Failed to delete agent", error=str(e), agent_id=agent_id)
            raise FirestoreError(f"Failed to delete agent: {str(e)}") from e

