"""The Orchestrator that dynamically loads and runs the nodes."""
from __future__ import annotations

from importlib import import_module
from typing import Any, Dict, List, TypedDict

from app.engine.nodes.base import BaseNode


class Step(TypedDict, total=False):
    type: str
    config: Dict[str, Any]


def _class_name_from_node_type(node_type: str) -> str:
    # http_request_node -> HttpRequestNode
    return "".join(part.capitalize() for part in node_type.split("_"))


def run_workflow(workflow_definition: Dict[str, Any]) -> Dict[str, Any]:
    """
    Dynamically load and execute nodes as defined in the workflow.
    Returns a state dict keyed by node type.
    """
    state: Dict[str, Any] = {}
    steps: List[Step] = workflow_definition.get("steps", []) or []

    for idx, step in enumerate(steps, start=1):
        node_type = step.get("type")
        if not isinstance(node_type, str) or not node_type:
            raise ValueError(f"Step {idx}: 'type' is required")

        module_path = f"app.engine.nodes.{node_type}"
        class_name = _class_name_from_node_type(node_type)

        # Import module
        try:
            module = import_module(module_path)
        except Exception as e:
            raise ImportError(f"Step {idx}: cannot import module '{module_path}': {e}") from e

        # Resolve class
        try:
            NodeClass = getattr(module, class_name)
        except AttributeError as e:
            raise ImportError(f"Step {idx}: class '{class_name}' not found in '{module_path}'") from e

        # Validate base class
        if not issubclass(NodeClass, BaseNode):
            raise TypeError(f"Step {idx}: '{class_name}' must subclass BaseNode")

        # Instantiate and execute
        node = NodeClass(config=step.get("config", {}))
        try:
            output: Dict[str, Any] = node.execute(input_data=state)
        except Exception as e:
            raise RuntimeError(f"Step {idx} ({node_type}) failed: {e}") from e

        state[node_type] = output

    return state


