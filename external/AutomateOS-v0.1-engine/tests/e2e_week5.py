from __future__ import annotations

"""
End-of-Week-5 E2E test:
- Creates two workflows:
  A) HTTP 200 -> Filter(status_code == 200) => SUCCESS
  B) HTTP 404 -> Filter(status_code == 200) => FAILED
- Invokes the worker task directly (no Redis required) to run them.
"""

from datetime import datetime, timezone
from typing import Any, Dict
from sqlalchemy import desc
from typing import Any
from sqlmodel import Session, select

from app.db.session import create_db_and_tables, engine
from app.models.user import User
from app.models.workflow import Workflow, WorkflowRun
from app.core.security import get_password_hash
from app.engine.tasks import process_workflow


def ensure_admin() -> User:
    create_db_and_tables()
    with Session(engine) as s:
        user = s.exec(select(User).where(User.email == "admin@example.com")).first()
        if user:
            return user
        user = User(email="admin@example.com", name="Admin", hashed_password=get_password_hash("password1234"))
        s.add(user)
        s.commit()
        s.refresh(user)
        return user


def create_workflow(user_id: int, name: str, url: str) -> int:
    definition: Dict[str, Any] = {
        "steps": [
            {
                "type": "http_request_node",
                "config": {
                    "url": url,
                    "method": "GET",
                    "headers": {"User-Agent": "AutomateOS-Test"},
                },
            },
            {
                "type": "filter_node",
                "config": {
                    "condition": "input_data['http_request_node']['status_code'] == 200",
                },
            },
        ]
    }

    with Session(engine) as s:
        wf = Workflow(name=name, definition=definition, user_id=user_id)
        s.add(wf)
        s.commit()
        s.refresh(wf)
    assert wf.id is not None
    return wf.id


def latest_run_for(wf_id: int) -> WorkflowRun | None:
    with Session(engine) as s:
        # Order by created_at desc if present; else fallback to id desc
        order_col: Any = getattr(WorkflowRun, "created_at", getattr(WorkflowRun, "id"))
        runs = s.exec(
            select(WorkflowRun)
            .where(WorkflowRun.workflow_id == wf_id)
            .order_by(desc(order_col))
        ).all()
        return runs[0] if runs else None


def main() -> None:
    user = ensure_admin()

    # Scenario A: success path (200)
    assert user.id is not None
    wf_a_id = create_workflow(user.id, f"Week5 A - success {datetime.now(timezone.utc).isoformat()}", "https://httpbin.org/status/200")
    process_workflow(wf_a_id)
    run_a = latest_run_for(wf_a_id)
    status_a = getattr(run_a.status, "value", run_a.status) if run_a else None
    print("Scenario A - expected SUCCESS:", status_a)

    # Scenario B: failure path (404)
    wf_b_id = create_workflow(user.id, f"Week5 B - failure {datetime.now(timezone.utc).isoformat()}", "https://httpbin.org/status/404")
    try:
        process_workflow(wf_b_id)
    except Exception:
        # process_workflow itself catches and records failure; no re-raise expected.
        pass
    run_b = latest_run_for(wf_b_id)
    status_b = getattr(run_b.status, "value", run_b.status) if run_b else None
    print("Scenario B - expected FAILED:", status_b)


if __name__ == "__main__":
    main()
