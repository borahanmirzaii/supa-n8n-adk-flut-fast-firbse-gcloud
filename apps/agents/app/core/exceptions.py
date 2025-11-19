"""Custom exceptions for the application."""


class AgentException(Exception):
    """Base exception for agent-related errors."""

    pass


class AgentNotFoundError(AgentException):
    """Raised when an agent is not found."""

    pass


class SessionNotFoundError(AgentException):
    """Raised when a session is not found."""

    pass


class MessageNotFoundError(AgentException):
    """Raised when a message is not found."""

    pass


class ADKError(AgentException):
    """Raised when ADK operations fail."""

    pass


class FirestoreError(AgentException):
    """Raised when Firestore operations fail."""

    pass


class ValidationError(AgentException):
    """Raised when validation fails."""

    pass

