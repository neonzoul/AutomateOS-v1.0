# Packages

Shared TypeScript libraries used across apps and services.

## Structure

- `ui/` - Shared UI kit (Tailwind + shadcn/ui)
- `workflow-schema/` - Zod schemas for Workflow, Node, Edge, Run, Template
- `logger/` - Pino logger + OpenTelemetry integration
- `config/` - Shared config (tsconfig, eslint, prettier, tailwind presets)

## Usage

Import packages using the configured aliases:

```typescript
import { Button } from '@automateos/ui';
import { WorkflowSchema } from '@automateos/workflow-schema';
import { logger } from '@automateos/logger';
```

## Development

```bash
# Build all packages
pnpm build

# Build specific package
pnpm -C packages/ui build
```

Each package:
- Has its own `package.json` and TypeScript config
- Exports through `src/index.ts`
- Follows semver for breaking changes
- Includes comprehensive type definitions
