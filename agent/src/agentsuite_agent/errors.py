class AgentSuiteError(Exception):
    """Base exception for the agent backend."""


class ConfigurationError(AgentSuiteError):
    """Raised when required environment or runtime configuration is missing."""


class ExecutionError(AgentSuiteError):
    """Raised when a process cannot complete safely."""

