"""Core agent implementation using Google ADK."""

import structlog
from app.tools.firestore_tools import FirestoreTools

logger = structlog.get_logger()


class CoreAgent:
    """Core agent with ADK integration."""

    def __init__(self):
        """Initialize core agent."""
        self.tools = FirestoreTools()
        logger.info("Core agent initialized")

    async def run(self, payload: dict) -> dict:
        """
        Run agent with given payload.

        Args:
            payload: Request payload containing message and context

        Returns:
            Agent response
        """
        logger.info("Processing agent request", payload=payload)

        # TODO: Integrate with Google ADK
        # For now, return a simple response
        message = payload.get("message", "")
        session_id = payload.get("sessionId", "")

        response = {
            "response": f"Agent received: {message}",
            "sessionId": session_id,
            "metadata": {},
        }

        logger.info("Agent response generated", response=response)
        return response


# Global agent instance
core_agent = CoreAgent()

