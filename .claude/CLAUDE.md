# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutomateOS is not just another visual workflow automation platform - it's a transformative creative experience that makes automation feel magical. We're building the **"Final Cut Pro of Automation"** - a tool so beautiful, intuitive, and powerful that creators will fall in love with building workflows.

This is not about building software; this is about crafting an emotional experience that rivals Apple's greatest products. Every pixel, every animation, every interaction must contribute to a cohesive aesthetic that feels timeless, not trendy. We're creating something people will want to use every day, not because they have to, but because it brings them joy.

The platform consists of a Next.js creator studio, Node.js backend services, and is architected to support a future template ecosystem where creators can share their workflows as digital art pieces.

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

The project is in Sprint 5 focusing on the **Cinematic UX/UI Revolution**. We are transforming AutomateOS into a magical, emotionally engaging creative experience inspired by the movies "Her" and "La La Land".

Key areas:
- Cinematic workflow builder with organic, flowing design
- Warm, inviting color palette inspired by "Her" and "La La Land"
- Magical interactions and organic animations
- Emotionally engaging creator experience

## The AutomateOS Cinematic Experience

### Design Philosophy: Crafting Digital Poetry

We are creating more than software - we are crafting a **cinematic experience** that makes automation feel like digital poetry. Inspired by the emotional warmth of "Her" and the dreamy creativity of "La La Land," every interaction should feel magical and deeply human.

**Core Design Principles:**
- **Cinematic over Functional**: Every screen should feel like a beautiful movie scene
- **Warm over Cold**: Technology that feels alive, breathing, and emotionally engaging
- **Organic over Rigid**: Flowing, natural shapes that invite touch and exploration
- **Magical over Mechanical**: Automation that feels like conducting a symphony of creativity
- **Inspiring over Efficient**: Tools that make creators excited to build something beautiful every day

**The "Her" & "La La Land" Aesthetic:**
- **Warm coral gradients** that evoke sunset and intimate connections
- **Soft, flowing shapes** that feel organic and alive
- **Breathing animations** that make the interface feel conscious
- **Gentle, dreamy interactions** that surprise and delight
- **Cinematic typography** that tells a story with every word

### The Apple Standard

We measure ourselves against Apple's iconic products:
- **iPhone**: Intuitive gestures, glass-like surfaces, liquid animations
- **macOS**: Spatial organization, depth, subtle shadows and lighting
- **iPod**: Minimal controls, maximum impact, perfect proportions
- **Final Cut Pro**: Professional power wrapped in elegant simplicity

### Cinematic Color Psychology

**"Her" Inspired Warmth:**
- **Coral Sunset** (#FF6B6B): Love, creativity, human connection, the warmth of Samantha's voice
- **Soft Peach** (#FFB4A2): Intimacy, comfort, the glow of evening conversations
- **Warm Cream** (#FFF8F0): Canvas for possibilities, the light of understanding

**"La La Land" Dream Palette:**
- **Golden Hour** (#FFD93D): Dreams, possibility, the magic of Los Angeles sunsets
- **Lavender Twilight** (#A29BFE): Mystery, romance, the space between day and night
- **Sage Whisper** (#00DFA2): Growth, harmony, the quiet moments of reflection

**Cinematic Implementation:**
- **Gradient Backgrounds**: Flowing coral to peach, like movie lighting
- **Organic Shapes**: Soft, pill-like forms that feel alive and touchable
- **Breathing Elements**: Subtle animations that make the interface feel conscious
- **Contextual Color**: Different hues for different emotional states and actions

### Quality Standards (Non-Negotiable)

1. **Pixel-Perfect Craftsmanship**
   - Every icon, button, and layout refined to perfection
   - Typography that feels intentional and harmonious
   - Colors that evoke emotion, not just convey information

2. **Fluid Motion Design**
   - 60fps animations with organic easing curves
   - Transitions that feel inevitable, never jarring
   - Loading states that maintain user engagement
   - Hover effects that invite interaction

3. **Emotional Feedback**
   - Success states that feel celebratory
   - Error states that feel helpful, not punishing
   - Empty states that inspire action
   - Progress indicators that build anticipation

4. **Contextual Intelligence**
   - Interface adapts to user intent
   - Smart defaults that demonstrate understanding
   - Progressive disclosure that prevents overwhelm
   - Anticipatory design that feels telepathic

### Implementation Mandate

**NEVER ship anything that feels:**
- Generic or template-like
- Rushed or unfinished
- Cold or mechanical
- Confusing or overwhelming

**ALWAYS ship features that feel:**
- Handcrafted and intentional
- Polished and complete
- Warm and inviting
- Intuitive and empowering

### The "Quit Test"

If any feature doesn't meet our aesthetic standards, we don't ship it. Period. We would rather delay than compromise the vision. Every release must reinforce that AutomateOS is something special - a tool that creators are proud to use and excited to share.

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

## Aesthetic Implementation Guidelines

### Visual Hierarchy & Typography

**Typography System:**
- **Headlines**: SF Pro Display or similar (Apple's choice) - confident, modern
- **Body Text**: SF Pro Text - readable, neutral, professional
- **Code/Technical**: SF Mono - precise, technical, authoritative
- **Emotional Moments**: Custom selection for warmth (consider Avenir Next or similar)

**Color Psychology:**
- **Primary Coral `#E84B4B`**: Love, creativity, human warmth (inspired by "Her")
- **Accent Gold `#F4C2A1`**: Possibility, dreams, dawn light (inspired by "La La Land")
- **Deep Navy `#1A1B3A`**: Depth, professionalism, night sky elegance
- **Soft Cream `#FFF8F0`**: Canvas, possibilities, paper texture
- **Grays**: Sophisticated neutral progression from `#FAFAFA` to `#1C1C1E`

### Motion Language

**Spring Physics:**
```css
/* Signature easing for all AutomateOS animations */
transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);

/* Micro-interactions */
transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

/* Page transitions */
transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
```

**Interaction States:**
- **Idle**: Soft, breathing animations
- **Hover**: Gentle lift with subtle shadow
- **Active**: Confident scale with haptic-like feedback
- **Success**: Celebratory expansion with particle effects
- **Error**: Gentle shake with warm, helpful messaging

### Spatial Design

**Layout Principles:**
- **Golden Ratio** proportions wherever possible
- **Generous whitespace** - never cramped or cluttered
- **Depth layers**: Background → Surface → Elevated → Overlay
- **Edge-to-edge thinking**: Full canvas utilization like Final Cut Pro

**Component Architecture:**
- **Cards**: Subtle elevation, rounded corners (8px), gentle shadows
- **Buttons**: Pill-shaped for primary actions, minimal for secondary
- **Forms**: Floating labels, progressive validation, contextual help
- **Panels**: Slide transitions, backdrop blur, spatial awareness

### Interaction Patterns

**Navigation Philosophy:**
- **Spatial navigation**: Users navigate through spaces, not pages
- **Contextual panels**: Inspector slides from right, properties from left
- **Gesture-friendly**: Swipe, pinch, drag feel natural on all devices
- **Keyboard mastery**: Power users can flow entirely via shortcuts

**Feedback Systems:**
- **Visual**: Color changes, shape transforms, size adjustments
- **Motion**: Organic animations that feel alive
- **Sound**: (Future) Subtle audio cues for major actions
- **Haptic**: (Mobile) Gentle vibrations for confirmations

### Implementation Rules

**Code Standards:**
- All animations must use CSS transforms (not layout properties)
- Implement prefers-reduced-motion for accessibility
- Use CSS custom properties for theming consistency
- Component libraries should export motion variants

**Performance Mandates:**
- 60fps animations on all supported devices
- <100ms response time for all interactions
- Progressive loading with beautiful skeleton states
- Memory-efficient animation cleanup

**Cross-Platform Consistency:**
- Gesture patterns must work on touch and mouse
- Responsive breakpoints that feel intentional, not automatic
- Dark mode that's not just inverted colors, but considered mood
- High DPI support with vector-first assets

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
