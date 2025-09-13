from typing import List, TYPE_CHECKING, Dict, Any
from datetime import datetime, timezone
from enum import Enum
from sqlmodel import Field, Relationship, SQLModel, Column, JSON
from sqlalchemy import String

# TYPE_CHECKING is used to avoid circular imports while still providing type hints
# This allows us to reference User class without importing it at runtime
if TYPE_CHECKING:
    from .user import User

# == Initailize [Declare]== | Declarative Style for SQLModel
class Workflow(SQLModel, table=True):
    """
    Workflow model representing an automation workflow in the system.
    
    A workflow defines a series of automated tasks or operations that can be
    executed by the system. Each workflow belongs to a user and can have
    multiple execution runs associated with it.
    """
    
    # Primary key for the workflow table
    id: int | None = Field(default=None, primary_key=True)
    
    # Human-readable name for the workflow
    name: str
    
    # JSON field containing the workflow definition/configuration
    # This stores the actual workflow steps, conditions, and parameters
    definition: Dict[str, Any] = Field(sa_column=Column(JSON))
    
    # Foreign key linking to the user who owns this workflow
    user_id: int | None = Field(default=None, foreign_key="user.id")
    
    # Relationship to the User model (many workflows to one user)
    user: "User" = Relationship(back_populates="workflows")

    # Relationship to WorkflowRun model (one workflow to many runs)
    runs: List["WorkflowRun"] = Relationship(back_populates="workflow")

# == Initailize [Declare]== | Declarative Style for SQLModel
class WorkflowRun(SQLModel, table=True):
    """
    WorkflowRun model representing a single execution instance of a workflow.
    
    Each time a workflow is executed, a WorkflowRun record is created to track
    the execution status, logs, and results. This provides an audit trail
    and history of all workflow executions.
    """
    
    class WorkflowRunStatus(str, Enum):
        PENDING = "pending"
        RUNNING = "running"
        SUCCESS = "success"
        FAILED = "failed"
        CANCELED = "canceled"

    # Primary key for the workflow run table
    id: int | None = Field(default=None, primary_key=True)
    
    # Current status of the workflow run
    # Stored as TEXT in SQLite for compatibility; validated via Enum in Python
    status: "WorkflowRunStatus" = Field(default=WorkflowRunStatus.PENDING, sa_column=Column(String))
    
    # JSON field containing execution logs and debugging information
    # This can store step-by-step execution details, error messages, etc.
    logs: Dict[str, Any] | None = Field(default=None, sa_column=Column(JSON))

    # Creation timestamp for the run
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)

    # When the run finished (success/failed/canceled); None while pending/running
    finished_at: datetime | None = Field(default=None, index=True)

    # Foreign key linking to the workflow that was executed
    workflow_id: int | None = Field(default=None, foreign_key="workflow.id")
    
    # Relationship to the Workflow model (many runs to one workflow)
    workflow: "Workflow" = Relationship(back_populates="runs")