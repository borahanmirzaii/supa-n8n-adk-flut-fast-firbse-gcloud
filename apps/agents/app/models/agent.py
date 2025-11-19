"""Agent Pydantic models."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

from pydantic import BaseModel, Field


class AgentStatus(str, Enum):
    """Agent status enum."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"


class AgentConfig(BaseModel):
    """Agent configuration model."""

    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    system_prompt: Optional[str] = None
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, ge=1, le=4096)
    tools: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AgentCreate(BaseModel):
    """Agent creation request model."""

    config: AgentConfig
    status: AgentStatus = AgentStatus.ACTIVE


class AgentUpdate(BaseModel):
    """Agent update request model."""

    config: Optional[AgentConfig] = None
    status: Optional[AgentStatus] = None


class AgentResponse(BaseModel):
    """Agent response model."""

    id: str
    config: AgentConfig
    status: AgentStatus
    created_at: datetime
    updated_at: datetime
    created_by: str

    class Config:
        """Pydantic config."""

        from_attributes = True


class AgentListResponse(BaseModel):
    """Agent list response model."""

    agents: List[AgentResponse]
    total: int
    page: int
    page_size: int

