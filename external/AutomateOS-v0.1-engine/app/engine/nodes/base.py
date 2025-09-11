"""Base Node Contract
This module defines the BaseNode contract that every node plugin must follow.
"""

from typing import Any, Dict

class BaseNode:
    """The contract that all nodes must follow."""

    def __init__(self, config: Dict[str, Any]):
        # configuration for the node (from the workflow definition)
        self.config = config

    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the node's logic.
        Must be implemented by subclasses.
        """
        raise NotImplementedError("Each node must implement an execute method.")