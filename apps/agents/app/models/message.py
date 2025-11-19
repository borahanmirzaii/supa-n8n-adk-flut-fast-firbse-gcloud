"""Message Pydantic models."""

from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum

from pydantic import BaseModel, Field


class MessageRole(str, Enum):
    """Message role enum."""

    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"
    SYSTEM = "system"


class MessageCreate(BaseModel):
    """Message creation request model."""

    session_id: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)
    role: MessageRole = MessageRole.USER
    metadata: Dict[str, Any] = Field(default_factory=dict)


class MessageResponse(BaseModel):
    """Message response model."""

    id: str
    session_id: str
    content: str
    role: MessageRole
    metadata: Dict[str, Any]
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class ChatRequest(BaseModel):
    """Chat request model."""

    message: str = Field(..., min_length=1)
    session_id: Optional[str] = None
    context: Dict[str, Any] = Field(default_factory=dict)
    stream: bool = False


class ChatResponse(BaseModel):
    """Chat response model."""

    response: str
    session_id: str
    message_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ChatStreamChunk(BaseModel):
    """Chat stream chunk model."""

    content: str
    done: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SessionCreate(BaseModel):
    """Session creation request model."""

    user_id: str = Field(..., min_length=1)
    agent_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SessionResponse(BaseModel):
    """Session response model."""

    id: str
    user_id: str
    agent_id: Optional[str] = None
    metadata: Dict[str, Any]
    created_at: datetime
    lastMessage_at: datetime = Field(..., alias="last_message_at")

    class Config:
        """Pydantic config."""

        from_attributes = True


class MessageListResponse(BaseModel):
    """Message list response model."""

    messages: List[MessageResponse]
    total: int
    session_id: str

