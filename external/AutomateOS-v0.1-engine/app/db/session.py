# :Modules: Database Session & Engine
# [[ Database Dependency ]]
import os

from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy import inspect as sa_inspect, text
from typing import Any

"""
Database URL resolution:
- Use env var DATABASE_URL if provided (e.g., postgresql+psycopg2://user:pass@host:5432/db)
- Otherwise, default to a local SQLite database file.
"""
# DB Path/name.db (default for local dev)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir, os.pardir))
db_file_path = os.path.join(project_root, "database.db")

DATABASE_URL = os.getenv('DATABASE_URL', f'sqlite:///{db_file_path}')

# === Create Engine ===
engine = create_engine(DATABASE_URL, echo=True)

# Dependency for API Endpoints
def get_session():
    with Session(engine) as session:
        yield session

# Function for main.py called on startup
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    # Lightweight migration: ensure WorkflowRun.created_at exists (SQLite only)
    try:
        if engine.dialect.name == "sqlite":
            from app.models.workflow import WorkflowRun  # local import to avoid cycles
            inspector = sa_inspect(engine)
            table_obj: Any = getattr(WorkflowRun, "__table__", None)
            table_name: str = getattr(table_obj, "name", "workflowrun")
            column_names = [col["name"] for col in inspector.get_columns(table_name)]
            if "created_at" not in column_names:
                with engine.begin() as conn:
                    conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN created_at TIMESTAMP"))
                    # Backfill existing rows with current UTC timestamp
                    conn.execute(text(f"UPDATE {table_name} SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"))
            if "finished_at" not in column_names:
                with engine.begin() as conn:
                    conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN finished_at TIMESTAMP"))
            if "status" not in column_names:
                # In case table was created without status for some reason; add as TEXT
                with engine.begin() as conn:
                    conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN status TEXT DEFAULT 'pending'"))
    except Exception as e:
        # Non-fatal: log and continue
        print(f"[DB MIGRATION] Skipped or failed to ensure created_at: {e}")