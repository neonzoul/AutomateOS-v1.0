# Workflow API CRUD Endpoints
from __future__ import annotations

from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy import desc, func
from sqlmodel import Session, select

from app.api.v1.deps import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.models.workflow import Workflow, WorkflowRun
from app.schemas.workflow import WorkflowCreate, WorkflowRead, WorkflowRunRead

router = APIRouter()

# === Create Workflow ===
@router.post(
    "/",
    response_model=WorkflowRead,
    summary="Create a new workflow",
    description="Create and persist a workflow definition owned by the current user.",
)
async def create_workflow(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    workflow_in: WorkflowCreate
) -> WorkflowRead:
    db_workflow = Workflow.model_validate(workflow_in, update={"user_id": current_user.id})

    session.add(db_workflow)
    session.commit()
    session.refresh(db_workflow)
    return WorkflowRead.model_validate(db_workflow)
# [[ for invalid Input or Request FastAPI will handle Error ]]

# === Read Workflow ===

# --- Read List---
@router.get(
    "/",
    response_model=List[WorkflowRead],
    summary="List workflows",
    description="Return all workflows belonging to the current user.",
) # [[ "/" == "/api/v1/workflows/" | Type List for return multiple objects.(workflows)]]
async def read_workflow(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> List[WorkflowRead]:
    # [[ Retrieve all workflows for the current user. ]]
    workflows = session.exec(
        select(Workflow).where(Workflow.user_id == current_user.id)
    ).all()
    return [WorkflowRead.model_validate(w) for w in workflows]  # [[ Explicitly convert each DB model to its corresponding Pydantic schema. ]]

# --- Read Single by ID ---
@router.get(
    "/{workflow_id}",
    response_model=WorkflowRead,
    summary="Get a workflow by ID",
    description="Retrieve a workflow by its ID if it belongs to the current user.",
)
async def read_single_workflow(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    workflow_id: int
) -> WorkflowRead:
    # [[ Retireve sigle workflow by workflow ID ]]
    # Fetch workflow
    workflow = session.get(Workflow, workflow_id)

    if not workflow or workflow.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )

    # Return explicit schema for consistency with other endpoints
    return WorkflowRead.model_validate(workflow)


# --- History: list runs for a workflow ---
@router.get(
    "/{workflow_id}/runs",
    response_model=List[WorkflowRunRead],
    summary="List workflow runs",
    description="Return recent execution runs for a workflow (newest first).",
)
async def read_workflow_runs(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    workflow_id: int,
    limit: int = 50,
    offset: int = 0,
    status_filter: Optional[str] = None,
) -> List[WorkflowRunRead]:
    """Retrieve the execution history (runs) for a specific workflow.

    - Paginates with limit/offset (defaults to 50 items).
    - Optionally filters by run status (e.g., "Success", "Failed").
    - Orders newest first by created_at when available (falls back to id).
    """

    # Ensure workflow exists and belongs to current user
    workflow = session.get(Workflow, workflow_id)
    if not workflow or workflow.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )

    # clamp limit to a sane range to prevent abuse
    limit = max(1, min(limit, 200))
    offset = max(0, offset)

    stmt = select(WorkflowRun).where(WorkflowRun.workflow_id == workflow_id)
    if status_filter:
        # Validate against enum values if present
        valid_statuses = {s.value for s in getattr(WorkflowRun, "WorkflowRunStatus").__members__.values()} if hasattr(WorkflowRun, "WorkflowRunStatus") else None
        if valid_statuses and status_filter not in valid_statuses:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Invalid status_filter. Allowed: {sorted(valid_statuses)}")
        stmt = stmt.where(WorkflowRun.status == status_filter)

    # Prefer created_at desc if the model/table provides it; otherwise fall back to id desc
    if hasattr(WorkflowRun, "created_at"):
        order_col: Any = getattr(WorkflowRun, "created_at")
    else:
        order_col: Any = getattr(WorkflowRun, "id")
    stmt = stmt.order_by(desc(order_col))

    runs = session.exec(stmt.offset(offset).limit(limit)).all()
    # For total counts, use the HEAD or /runs/meta endpoint
    return [WorkflowRunRead.model_validate(r) for r in runs]


# --- History: metadata (total count) ---
@router.get(
    "/{workflow_id}/runs/meta",
    summary="Runs metadata (total count)",
    description="Return total count of runs for a workflow (filterable by status).",
)
async def read_workflow_runs_meta(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    workflow_id: int,
    status_filter: Optional[str] = None,
) -> Dict[str, int]:
    """Return total count of runs for a workflow (optional status filter)."""

    workflow = session.get(Workflow, workflow_id)
    if not workflow or workflow.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )

    stmt = select(func.count()).select_from(WorkflowRun).where(WorkflowRun.workflow_id == workflow_id)
    if status_filter:
        stmt = stmt.where(WorkflowRun.status == status_filter)

    total = session.exec(stmt).one()
    # session.exec(...).one() returns a scalar in SQLModel; ensure int
    return {"total": int(total)}


# --- History: HEAD for total count header ---
@router.head(
    "/{workflow_id}/runs",
    summary="HEAD: X-Total-Count for runs",
    description="HEAD endpoint that sets X-Total-Count header for number of runs.",
)
async def head_workflow_runs(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    workflow_id: int,
    status_filter: Optional[str] = None,
    response: Response,
) -> Response:
    """HEAD endpoint that returns X-Total-Count for runs (optional status filter)."""
    workflow = session.get(Workflow, workflow_id)
    if not workflow or workflow.user_id != current_user.id:
        # For HEAD, still use 404 if not found
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")

    stmt = select(func.count()).select_from(WorkflowRun).where(WorkflowRun.workflow_id == workflow_id)
    if status_filter:
        stmt = stmt.where(WorkflowRun.status == status_filter)

    total = session.exec(stmt).one()
    response.headers["X-Total-Count"] = str(int(total))
    # No body for HEAD; 204 No Content is appropriate
    response.status_code = status.HTTP_204_NO_CONTENT
    return response