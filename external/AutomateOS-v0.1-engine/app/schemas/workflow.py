# Workflow API Schemas (data shapes)
from __future__ import annotations

from typing import Dict, Any, Literal
from datetime import datetime
from sqlmodel import SQLModel

from app.schemas.base import BaseSchema

# Shared projerties for a workflow.
class WorkflowBase(BaseSchema, SQLModel):
    name: str
    definition: Dict[str, Any]

# Creating a now workflow Schema
class WorkflowCreate(WorkflowBase):
    pass # [[ ? Just for same fields as the base for now ]]

# Reading a workflow Schema
class WorkflowRead(WorkflowBase):
    id: int
    user_id: int

# Updating a workflow Schema
class WorkflowUpdate(SQLModel):
    name: str | None = None
    definition: Dict[str, Any] | None = None


# Reading a workflow run Schema (for history API)
class WorkflowRunRead(BaseSchema, SQLModel):
    id: int
    workflow_id: int
    status: Literal["pending", "running", "success", "failed", "canceled"]
    logs: Dict[str, Any]
    created_at: datetime
    finished_at: datetime | None
