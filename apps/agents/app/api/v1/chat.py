"""Chat/conversation API endpoints with streaming support."""

from typing import Annotated, Optional
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from firebase_admin import auth
from slowapi import Limiter
from slowapi.util import get_remote_address
import structlog

from app.core.dependencies import get_current_user, get_optional_user
from app.models.message import (
    ChatRequest,
    ChatResponse,
    ChatStreamChunk,
    MessageCreate,
    MessageResponse,
    MessageListResponse,
    SessionCreate,
    SessionResponse,
)
from app.services.adk_service import ADKService
from app.services.agent_service import AgentService
from app.core.firebase_admin import get_firestore_client
from app.core.exceptions import SessionNotFoundError, FirestoreError

logger = structlog.get_logger()

router = APIRouter(prefix="/chat", tags=["chat"])

# Rate limiter instance (will be set from app state)
limiter: Limiter | None = None


def set_limiter(limiter_instance: Limiter) -> None:
    """Set rate limiter instance."""
    global limiter
    limiter = limiter_instance


@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    request: Request,
    session_data: SessionCreate,
    current_user: Annotated[auth.UserRecord, Depends(get_current_user)],
) -> SessionResponse:
    """
    Create a new chat session.

    Args:
        session_data: Session creation data
        current_user: Current authenticated user

    Returns:
        Created session response
    """
    try:
        db = get_firestore_client()
        session_id = str(uuid.uuid4())
        now = datetime.utcnow()

        session_doc = {
            "id": session_id,
            "user_id": current_user.uid,
            "agent_id": session_data.agent_id,
            "metadata": session_data.metadata,
            "created_at": now,
            "last_message_at": now,
        }

        doc_ref = db.collection("agents-sessions").document(session_id)
        doc_ref.set(session_doc)

        logger.info("Session created", session_id=session_id, user_id=current_user.uid)

        return SessionResponse(
            id=session_id,
            user_id=current_user.uid,
            agent_id=session_data.agent_id,
            metadata=session_data.metadata,
            created_at=now,
            last_message_at=now,
        )

    except Exception as e:
        logger.error("Failed to create session", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session: {str(e)}",
        ) from e


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    current_user: Annotated[auth.UserRecord, Depends(get_current_user)],
) -> SessionResponse:
    """
    Get session by ID.

    Args:
        session_id: Session ID
        current_user: Current authenticated user

    Returns:
        Session response

    Raises:
        HTTPException: If session not found
    """
    try:
        db = get_firestore_client()
        doc_ref = db.collection("agents-sessions").document(session_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise SessionNotFoundError(f"Session {session_id} not found")

        data = doc.to_dict()
        assert data is not None

        # Verify user owns the session
        if data["user_id"] != current_user.uid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

        return SessionResponse(
            id=data["id"],
            user_id=data["user_id"],
            agent_id=data.get("agent_id"),
            metadata=data.get("metadata", {}),
            created_at=data["created_at"],
            last_message_at=data["last_message_at"],
        )

    except SessionNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get session", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e


@router.post("", response_model=ChatResponse)
async def chat(
    request: Request,
    chat_request: ChatRequest,
    current_user: Annotated[auth.UserRecord, Depends(get_current_user)],
) -> ChatResponse:
    """
    Send a chat message and get response.

    Args:
        chat_request: Chat request data
        current_user: Current authenticated user

    Returns:
        Chat response
    """
    try:
        db = get_firestore_client()
        adk_service = ADKService()

        # Get or create session
        session_id = chat_request.session_id
        if not session_id:
            # Create new session
            session_doc = {
                "id": str(uuid.uuid4()),
                "user_id": current_user.uid,
                "created_at": datetime.utcnow(),
                "last_message_at": datetime.utcnow(),
            }
            session_id = session_doc["id"]
            db.collection("agents-sessions").document(session_id).set(session_doc)

        # Save user message
        message_id = str(uuid.uuid4())
        user_message = {
            "id": message_id,
            "session_id": session_id,
            "content": chat_request.message,
            "role": "user",
            "created_at": datetime.utcnow(),
            "metadata": chat_request.context,
        }
        db.collection("agents-sessions").document(session_id).collection("messages").document(
            message_id
        ).set(user_message)

        # Get agent response
        response_data = await adk_service.run_agent(
            message=chat_request.message,
            session_id=session_id,
            context=chat_request.context,
        )

        # Save assistant message
        assistant_message_id = str(uuid.uuid4())
        assistant_message = {
            "id": assistant_message_id,
            "session_id": session_id,
            "content": response_data["response"],
            "role": "assistant",
            "created_at": datetime.utcnow(),
            "metadata": response_data.get("metadata", {}),
        }
        db.collection("agents-sessions").document(session_id).collection("messages").document(
            assistant_message_id
        ).set(assistant_message)

        # Update session last_message_at
        db.collection("agents-sessions").document(session_id).update(
            {"last_message_at": datetime.utcnow()}
        )

        logger.info("Chat completed", session_id=session_id, user_id=current_user.uid)

        return ChatResponse(
            response=response_data["response"],
            session_id=session_id,
            message_id=assistant_message_id,
            metadata=response_data.get("metadata", {}),
        )

    except Exception as e:
        logger.error("Chat failed", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat failed: {str(e)}",
        ) from e


@router.post("/stream")
async def chat_stream(
    request: Request,
    chat_request: ChatRequest,
    current_user: Annotated[auth.UserRecord, Depends(get_current_user)],
) -> StreamingResponse:
    """
    Send a chat message and get streaming response (SSE).

    Args:
        chat_request: Chat request data
        current_user: Current authenticated user

    Returns:
        Streaming response with Server-Sent Events
    """
    try:
        db = get_firestore_client()
        adk_service = ADKService()

        # Get or create session
        session_id = chat_request.session_id
        if not session_id:
            session_doc = {
                "id": str(uuid.uuid4()),
                "user_id": current_user.uid,
                "created_at": datetime.utcnow(),
                "last_message_at": datetime.utcnow(),
            }
            session_id = session_doc["id"]
            db.collection("agents-sessions").document(session_id).set(session_doc)

        # Save user message
        message_id = str(uuid.uuid4())
        user_message = {
            "id": message_id,
            "session_id": session_id,
            "content": chat_request.message,
            "role": "user",
            "created_at": datetime.utcnow(),
        }
        db.collection("agents-sessions").document(session_id).collection("messages").document(
            message_id
        ).set(user_message)

        async def generate_stream():
            """Generate SSE stream."""
            full_response = ""
            try:
                async for chunk in adk_service.stream_agent_response(
                    message=chat_request.message,
                    session_id=session_id,
                    context=chat_request.context,
                ):
                    full_response += chunk
                    chunk_data = ChatStreamChunk(
                        content=chunk,
                        done=False,
                    )
                    yield f"data: {chunk_data.model_dump_json()}\n\n"

                # Save complete assistant message
                assistant_message_id = str(uuid.uuid4())
                assistant_message = {
                    "id": assistant_message_id,
                    "session_id": session_id,
                    "content": full_response,
                    "role": "assistant",
                    "created_at": datetime.utcnow(),
                }
                db.collection("agents-sessions").document(session_id).collection("messages").document(
                    assistant_message_id
                ).set(assistant_message)

                # Update session
                db.collection("agents-sessions").document(session_id).update(
                    {"last_message_at": datetime.utcnow()}
                )

                # Send final chunk
                final_chunk = ChatStreamChunk(content="", done=True)
                yield f"data: {final_chunk.model_dump_json()}\n\n"

            except Exception as e:
                logger.error("Streaming error", error=str(e))
                error_chunk = ChatStreamChunk(
                    content=f"Error: {str(e)}",
                    done=True,
                    metadata={"error": True},
                )
                yield f"data: {error_chunk.model_dump_json()}\n\n"

        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )

    except Exception as e:
        logger.error("Chat stream failed", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat stream failed: {str(e)}",
        ) from e


@router.get("/sessions/{session_id}/messages", response_model=MessageListResponse)
async def get_messages(
    session_id: str,
    current_user: Annotated[auth.UserRecord, Depends(get_current_user)],
    limit: int = 50,
) -> MessageListResponse:
    """
    Get messages for a session.

    Args:
        session_id: Session ID
        current_user: Current authenticated user
        limit: Maximum number of messages

    Returns:
        Message list response
    """
    try:
        db = get_firestore_client()

        # Verify session exists and user owns it
        session_ref = db.collection("agents-sessions").document(session_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            raise SessionNotFoundError(f"Session {session_id} not found")

        session_data = session_doc.to_dict()
        if session_data and session_data.get("user_id") != current_user.uid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

        # Get messages
        messages_ref = (
            session_ref.collection("messages")
            .order_by("created_at", direction="desc")
            .limit(limit)
        )
        messages_docs = messages_ref.stream()

        messages = []
        for doc in messages_docs:
            data = doc.to_dict()
            if data:
                from app.models.message import MessageRole

                messages.append(
                    MessageResponse(
                        id=data["id"],
                        session_id=data["session_id"],
                        content=data["content"],
                        role=MessageRole(data["role"]),
                        metadata=data.get("metadata", {}),
                        created_at=data["created_at"],
                    )
                )

        # Reverse to get chronological order
        messages.reverse()

        logger.info(
            "Messages retrieved",
            session_id=session_id,
            count=len(messages),
            user_id=current_user.uid,
        )

        return MessageListResponse(
            messages=messages,
            total=len(messages),
            session_id=session_id,
        )

    except SessionNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get messages", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e

