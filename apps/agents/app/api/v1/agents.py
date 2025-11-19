"""Agent CRUD API endpoints."""

from typing import Annotated, Optional

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from firebase_admin import auth
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
import structlog

from app.core.dependencies import get_current_user
from app.models.agent import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
    AgentListResponse,
    AgentStatus,
)
from app.services.agent_service import AgentService
from app.core.exceptions import AgentNotFoundError, FirestoreError

logger = structlog.get_logger()

router = APIRouter(prefix="/agents", tags=["agents"])

# Rate limiter instance (will be set from app state)
limiter: Limiter | None = None


def set_limiter(limiter_instance: Limiter) -> None:
    """Set rate limiter instance."""
    global limiter
    limiter = limiter_instance


@router.post("", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    request: Request,
    agent_data: AgentCreate,
    current_user: Annotated[auth.UserRecord, Depends(get_current_user)],
) -> AgentResponse:
    """
    Create a new agent.

    Args:
        agent_data: Agent creation data
        current_user: Current authenticated user

    Returns:
        Created agent response
    """
    try:
        service = AgentService()
        agent = await service.create_agent(agent_data, current_user.uid)
        logger.info("Agent created via API", agent_id=agent.id, user_id=current_user.uid)
        return agent
    except FirestoreError as e:
        logger.error("Failed to create agent", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    current_user: Annotated[auth.UserRecord, Depends(get_current_user)],
) -> AgentResponse:
    """
    Get agent by ID.

    Args:
        agent_id: Agent ID
        current_user: Current authenticated user

    Returns:
        Agent response

    Raises:
        HTTPException: If agent not found
    """
    try:
        service = AgentService()
        agent = await service.get_agent(agent_id)
        logger.info("Agent retrieved", agent_id=agent_id, user_id=current_user.uid)
        return agent
    except AgentNotFoundError as e:
        logger.warning("Agent not found", agent_id=agent_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e
    except FirestoreError as e:
        logger.error("Failed to get agent", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e


@router.get("", response_model=AgentListResponse)
async def list_agents(
    current_user: Annotated[auth.UserRecord, Depends(get_current_user)],
    status_filter: Optional[AgentStatus] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> AgentListResponse:
    """
    List agents with optional filtering.

    Args:
        current_user: Current authenticated user
        status_filter: Optional status filter
        limit: Maximum number of results
        offset: Offset for pagination

    Returns:
        Agent list response
    """
    try:
        service = AgentService()
        agents = await service.list_agents(
            user_id=current_user.uid,
            status=status_filter,
            limit=limit,
            offset=offset,
        )
        logger.info("Agents listed", count=len(agents), user_id=current_user.uid)
        return AgentListResponse(
            agents=agents,
            total=len(agents),
            page=offset // limit + 1,
            page_size=limit,
        )
    except FirestoreError as e:
        logger.error("Failed to list agents", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e


@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    agent_data: AgentUpdate,
    current_user: Annotated[auth.UserRecord, Depends(get_current_user)],
) -> AgentResponse:
    """
    Update an agent.

    Args:
        agent_id: Agent ID
        agent_data: Agent update data
        current_user: Current authenticated user

    Returns:
        Updated agent response

    Raises:
        HTTPException: If agent not found
    """
    try:
        service = AgentService()
        agent = await service.update_agent(agent_id, agent_data, current_user.uid)
        logger.info("Agent updated", agent_id=agent_id, user_id=current_user.uid)
        return agent
    except AgentNotFoundError as e:
        logger.warning("Agent not found", agent_id=agent_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e
    except FirestoreError as e:
        logger.error("Failed to update agent", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: str,
    current_user: Annotated[auth.UserRecord, Depends(get_current_user)],
) -> None:
    """
    Delete an agent.

    Args:
        agent_id: Agent ID
        current_user: Current authenticated user

    Raises:
        HTTPException: If agent not found
    """
    try:
        service = AgentService()
        await service.delete_agent(agent_id, current_user.uid)
        logger.info("Agent deleted", agent_id=agent_id, user_id=current_user.uid)
    except AgentNotFoundError as e:
        logger.warning("Agent not found", agent_id=agent_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e
    except FirestoreError as e:
        logger.error("Failed to delete agent", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e

