# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutomateOS is a visual workflow automation platform (monorepo) that enables users to build, share, and run workflows without code. The platform consists of a Next.js creator studio, Node.js backend services, and is architected to support a future template ecosystem.

## Repository Structure

- **`apps/dev-web`** - Creator Studio (Next.js + React Flow) - Primary development focus
- **`services/`** - Backend services (api-gateway, orchestrator)
- **`external/engine`** - Workflow execution runtime (currently Node.js mock)
- **`packages/`** - Shared libraries (workflow-schema, ui, logger, config)

## Essential Commands

```bash
# Development
pnpm dev                        # Start all dev servers
pnpm -C apps/dev-web dev        # Start only dev-web
pnpm dev:with-mock              # Start with mock gateway

# Testing
pnpm test                       # Run all tests via turbo
pnpm -C apps/dev-web test       # Run unit tests
pnpm -C apps/dev-web test:e2e  # Run Playwright E2E tests
pnpm -C apps/dev-web test:e2e:mock  # Run E2E with mock backend

# Build & Lint
pnpm build                      # Build all workspaces
pnpm lint                       # Lint all workspaces
pnpm -C apps/dev-web typecheck  # Run TypeScript checks

# Docker Stack
pnpm docker:dev                 # Start backend services in Docker
pnpm docker:dev:down            # Stop Docker services
```

## High-Level Architecture

### State Management

The application uses Zustand for global state management. The main store (`apps/dev-web/src/core/state.ts`) manages:

- Workflow nodes and edges
- Node selection state
- Run status and logs
- Canvas viewport and UI state

### Schema-First Development

All data validation uses Zod schemas from `@automateos/workflow-schema`. Forms are built with react-hook-form + zodResolver. Node configurations are auto-generated from registry schemas.

### Node Registry Pattern

Custom workflow nodes follow a registry pattern:

- Each node type has: type identifier, Zod config schema, React component, and runtime adapter
- Nodes are registered centrally for type safety and consistency
- Inspector forms are dynamically generated from node schemas

### API Integration

Frontend communicates with backend via REST API:

1. Builder creates workflow graph → validates with WorkflowSchema
2. Run workflow: `POST /v1/runs` → orchestrator → engine
3. Poll status: `GET /v1/runs/:id` → update UI with progress

### Testing Strategy

- **Unit tests**: Colocated with source files (`*.test.ts`)
- **Integration tests**: In `test/` directories
- **E2E tests**: Playwright tests in `e2e/` directory
- Test environment supports both live backend and mocked gateway

## Current Development Focus

The project is in Sprint 4 focusing on credentials and run feedback. Key areas:

- Workflow builder with Start and HTTP nodes
- Run execution with real-time status updates
- Import/export functionality
- Schema-driven node configuration

## User Experience Delivery Standards

### First Impression Goals

Every feature delivered must exceed expectations and create a **"wow"** moment for users like Apple do with technology like Macintosh,iPhone in Automation, AI Agent sector. We aim to deliver the unexpected - an experience so polished and delightful that it surpasses what users anticipate from workflow automation tools.

### Quality Benchmarks

- **Visual Polish:** Every UI element should feel crafted, not generic
- **Micro-interactions:** Subtle animations that provide feedback and delight
- **Performance:** Instant response times, smooth 60fps animations
- **Accessibility:** Keyboard navigation, screen reader support, proper contrast
- **Mobile Responsive:** Works beautifully across all device sizes

### Delivery Philosophy

- Ship features that feel **finished**, not just functional
- Every interaction should reinforce the AutomateOS brand experience
- Users should feel empowered and creative, never confused or frustrated
- The interface should anticipate user needs and provide helpful guidance

## Important Patterns from Copilot Instructions

### Code Style

- Use TypeScript strict mode
- Validate all boundaries with Zod
- Prefer composition over inheritance
- Memoize selectors for performance
- Never store secrets in frontend/localStorage

### Component Organization

- `src/builder/*` - Builder feature modules
- `src/components/*` - Shared components
- `src/core/*` - State, HTTP clients, utilities

### Security

- Never expose secrets or keys in frontend code
- Backend handles all encryption (AES-GCM)
- Engine receives decrypted values only at runtime

### Testing Requirements

- Write unit tests for new features
- Include at least one failure path test
- Use `afterEach(resetBuilderStore)` to isolate tests
- Coverage targets: 85% lines, 80% branches

## Package Management

Always use workspace-aware commands when adding dependencies:

```bash
pnpm -C apps/dev-web add <package>      # Add to specific workspace
pnpm -C services/api-gateway add <dep>  # Add to service
```

## Docker Development

For full stack development with orchestrator and engine:

```bash
# Terminal 1: Start backend services
docker compose -f infra/docker-compose.dev.yml up --build

# Terminal 2: Start frontend with API connection
set NEXT_PUBLIC_API_BASE=http://localhost:8080  # Windows
pnpm -C apps/dev-web dev
```

Services available:

- API Gateway: http://localhost:8080
- Engine (mock): http://localhost:8081
- Orchestrator: http://localhost:3002

## UX/UI & Branding Guidelines

### Design Philosophy

AutomateOS follows the principle of **"GarageBand for Workflows"** - creators should feel joy and creativity while building. The interface should be **Mac-like in simplicity** where everything "just works" with minimal complexity.

### Brand Identity

- **Primary Color:** Warm Coral Red `#E84B4B` - human, emotional, inspired by _Her_
- **Secondary Colors:**
  - Soft Cream `#FFF3E9` - approachable, warm background
  - Deep Burgundy `#7A1E1E` - strong accent, dark mode contrast
  - Neutral Grays `#F5F5F5` (light) / `#222222` (dark) - text and structural balance

### Motion Design System

- **Transitions:** Smooth cross-dissolves with spring easing
- **Micro-interactions:**
  - Hover → subtle expansion
  - Active nodes → pulsing glow
  - Connector lines → flowing liquid effect
- **Overall Feel:** Gentle, organic motion that feels alive and conversational

### UX Principles

1. **Delight > Function** - Every action should reward the user
2. **Contextual Simplicity** - Forms, toggles, previews - never raw JSON for end-users
3. **Creator-First** - Profiles, templates as digital products, easy share/export
4. **Transparency** - Clear usage and cost visualization

### Implementation Guidelines

- Never expose raw JSON to end-users
- Smart defaults everywhere
- Animations with purpose, not gimmick
- Templates framed as digital products with preview, gallery, creator branding
- Interface should feel alive, conversational, and emotional

## Security & Open Source Considerations

### Frontend Security (Critical for Open Source)

- **Never commit secrets, API keys, or credentials** to repository
- Use environment variables for all sensitive configuration
- Sanitize all user inputs and validate with Zod schemas
- Implement proper CSRF protection for forms
- Use secure HTTP headers and Content Security Policy

### Business Logic Protection

- Keep proprietary algorithms and business logic in backend services
- Frontend should only contain UI logic and basic validation
- Sensitive operations must be authenticated and authorized server-side
- Use proper rate limiting and request validation

### Credential Management

- All credential encryption/decryption happens server-side only
- Frontend never stores or processes raw credentials
- Use secure token-based authentication
- Implement proper session management and logout

### Open Source Hygiene

- Regular dependency audits with `pnpm audit`
- Keep dependencies up to date
- Use `.gitignore` to prevent accidental secret commits
- Document security practices in contributing guidelines
- Implement pre-commit hooks for security scanning

### Compliance & Privacy

- No user data collection without explicit consent
- Proper data retention and deletion policies
- GDPR/privacy compliance considerations
- Clear terms of service and privacy policy
