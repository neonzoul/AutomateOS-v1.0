# AutomateOS — Code Comments & Style Guide

This document defines **how to comment code** in AutomateOS v1.  
Goal: make code easy to understand for new contributors and future AI assistants.

---

## General Principles

- **Clarity > Brevity** → Comments should _explain intent_, not restate code.
- **Context matters** → Always note _why_ a decision was made.
- **Consistency** → Same style across TypeScript, Python, and infra.

---

## TypeScript (Frontend & Services)

### Function / Module Header

```ts
/**
 * Compiles workflow into a DAG and dispatches to engine.
 * - Input: workflowId, nodes, edges
 * - Output: runId
 * - Why: keeps orchestrator logic decoupled from engine
 */
export async function compileWorkflow(...) { ... }
```

### Inline Notes

```ts
// ❌ Bad: just repeats code
// increment counter
count++;

// ✅ Good: explains *why*
count++; // track retries to avoid infinite loop
```

---

## React Components

- Top of file: purpose of component
- For props: describe non-obvious ones

```tsx
/**
 * InspectorPanel
 * Renders dynamic form for selected node based on Zod schema.
 * Auto-saves changes into Zustand store.
 */
```

---

## Python (Engine)

```python
def execute_node(node, context):
    """
    Execute a single node in the workflow.
    Args:
        node: dict with type/config
        context: runtime state
    Returns:
        result dict (success/fail, data)
    Why:
        This isolates execution per-node for retries and logging.
    """
```

---

## Infra (YAML, Docker, CI/CD)

```yaml
# Build & test only dev-web during Phase 1
# Later: expand to services/api-gateway + orchestrator
jobs:
  build-dev-web: ...
```

---

## Tags for Special Cases

- `// TODO:` → planned improvements
- `// FIXME:` → known bug/workaround
- `// NOTE:` → subtle behavior explained
- `// SECURITY:` → highlight sensitive code paths

---

## Summary

- Use comments to **teach future readers** (and AI assistants).
- Always explain _why_, not just _what_.
- Keep comments up-to-date with code changes.

---
