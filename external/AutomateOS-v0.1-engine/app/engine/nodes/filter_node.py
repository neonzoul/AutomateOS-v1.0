"""Filter node plugin.

This node reads from the orchestrator's accumulated state (``input_data``)
and evaluates a boolean condition provided via this node's configuration.
If the condition evaluates to ``True``, the node returns a small success
payload; otherwise, it raises to stop the workflow.

Example config:
    {"condition": "input_data['http_request_node']['status_code'] == 200"}
"""
from __future__ import annotations
from typing import Any, Dict

from app.engine.nodes.base import BaseNode


class FilterNode(BaseNode):
    """Evaluate a boolean expression against the orchestrator state.

    Contract:
    - Input: ``input_data`` (dict) = full orchestrator state from prior nodes.
    - Config: requires ``condition`` (str) – a Python boolean expression that
      can reference ``input_data``. Example: ``input_data['x']['ok'] is True``.
    - Output: dict like ``{"passed": True}`` when condition is True.
    - Errors: raises ValueError for bad config/expressions; raises RuntimeError
      when the condition evaluates to False (to stop the workflow).
    """

    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        # Fetch and validate the condition string from this node's config.
        condition = self.config.get("condition")
        if not isinstance(condition, str) or not condition:
            # Misconfiguration: enforce clear error early.
            raise ValueError("FilterNode requires a non-empty 'condition' string in its config.")

        print(f"FilterNode: Evaluating condition: {condition}")

        # Security: evaluate the expression in a restricted namespace.
        #  - No builtins exposed (prevents access to dangerous functions).
        #  - Only 'input_data' is available for reading prior node outputs.
        # Note: For stricter/safer policies, consider replacing eval with a
        # small DSL or a library (e.g., JMESPath) in the future.
        safe_globals: Dict[str, Any] = {"__builtins__": {}}
        safe_locals: Dict[str, Any] = {"input_data": input_data}

        try:
            result = eval(condition, safe_globals, safe_locals)  # noqa: S307 (intentional, sandboxed)
        except Exception as e:
            # Expression could not be evaluated (syntax/key errors, etc.).
            raise ValueError(f"FilterNode: invalid condition '{condition}': {e}") from e

        # Enforce that conditions resolve to a strict boolean.
        if not isinstance(result, bool):
            raise ValueError("FilterNode condition must evaluate to a boolean (True/False).")

        if result:
            print("FilterNode: Condition is TRUE. Continuing workflow.")
            # Return a minimal, predictable payload; the full state is carried by the orchestrator.
            return {"passed": True}

        # Signal a controlled stop when the condition fails.
        print("FilterNode: Condition is FALSE. Stopping workflow.")
        raise RuntimeError("FilterNode condition evaluated to False")