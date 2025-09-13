# E2E Smoke Test: Happy Path Workflow Execution

## Overview

This document describes the implementation of Day 9's acceptance criteria: **"E2E smoke: happy path"** - proving that a creator can run a simple workflow successfully.

## Test Coverage

### Primary Test: `smoke-happy-path.spec.ts`

**Goal**: Prove "creator can run a simple workflow"

**Test Flow**:

1. ✅ Add **Start + HTTP** nodes via toolbar buttons
2. ✅ Connect edge using click-connect mode (`connectOnClick=true`)
3. ✅ Set a valid URL in Inspector form (`https://httpbin.org/get`)
4. ✅ Click **Run** button and verify state transitions
5. ✅ Poll until **succeeded** status (with 15s timeout)
6. ✅ Screenshot node badges showing execution status
7. ✅ Verify logs contain success indicators

**Secondary Test**: Error handling with invalid URL to ensure graceful failures.

### Environment Support

#### Local Development (Live Services)

- **Projects**: `chromium-live`, `firefox-live`, `webkit`
- **Target**: Real API gateway → orchestrator → engine
- **URL**: Points to actual services running locally
- **Command**: `pnpm test:e2e:live`

#### CI Environment (Mocked Services)

- **Projects**: `chromium-mock`
- **Target**: Mock API gateway (Express server)
- **Reliability**: No external dependencies
- **Command**: `pnpm test:e2e:mock`

## Implementation Details

### Test Helper Functions

```typescript
// Core workflow setup
addStartAndHttpNodes(page); // Adds nodes via toolbar
connectNodes(page); // Connects via click-connect
configureHttpNode(page, url); // Sets URL in inspector

// Execution verification
executeWorkflow(page); // Runs and polls status
verifyNodeBadges(page); // Checks node status badges
captureNodeScreenshots(page); // Screenshots for verification
```

### Selectors Strategy

- **Canvas**: `[data-testid="canvas"]`
- **Nodes**: `[data-id="start"]`, `[data-id="http"]`
- **Run Button**: `[data-testid="run-button"]`
- **Status**: `[data-testid="run-panel"] div.inline-flex`
- **Inspector URL**: `input[placeholder="https://api.example.com"]`

### Mock Gateway

**File**: `mock-gateway.js`
**Port**: `3001`
**Endpoints**:

- `POST /v1/runs` → Creates mock run with async status updates
- `GET /v1/runs/:id` → Returns run status and logs
- `GET /health` → Health check

**Status Simulation**:

- `0ms`: `queued` → `202 { runId }`
- `500ms`: `running`
- `2000ms`: `succeeded` with steps and logs

## Running Tests

### Local Development

```bash
# All E2E tests (live services required)
pnpm test:e2e

# Just smoke tests against live services
pnpm test:e2e:smoke

# Live environment tests (API gateway + engine)
pnpm test:e2e:live

# Headed mode for debugging
pnpm test:e2e:headed
```

### CI/Mock Environment

```bash
# Start mock gateway
pnpm mock-gateway

# Run against mock (separate terminal)
pnpm test:e2e:mock
```

### GitHub Actions

- **Trigger**: Push to main/develop, PRs, manual dispatch
- **Strategy**: CI runs `chromium-mock` by default
- **Live Tests**: Only on main branch or with `[run-live-e2e]` in commit message
- **Artifacts**: Screenshots and HTML reports uploaded on failure

## Browser Matrix

| Environment | Chromium  | Firefox | Safari | Mobile Chrome | Mobile Safari |
| ----------- | --------- | ------- | ------ | ------------- | ------------- |
| **Local**   | ✅        | ✅      | ✅     | ✅            | ✅            |
| **CI**      | ✅ (mock) | ❌      | ❌     | ✅ (mock)     | ✅ (mock)     |

_Note: CI runs a focused set for speed and reliability_

## Configuration

### Playwright Config (`playwright.config.ts`)

```typescript
projects: [
  // Live environment (local dev)
  {
    name: 'chromium-live',
    testIgnore: process.env.CI ? /smoke-happy-path/ : undefined,
  },
  {
    name: 'firefox-live',
    testIgnore: process.env.CI ? /smoke-happy-path/ : undefined,
  },

  // CI environment (mocked)
  {
    name: 'chromium-mock',
    testMatch: /smoke-happy-path/,
    testIgnore: process.env.CI ? undefined : /.*/,
  },

  // Mobile testing
  { name: 'Mobile Chrome', testMatch: /smoke-happy-path/ },
];
```

### Environment Variables

- `CI=true` → Runs mocked tests only
- `USE_MOCK_GATEWAY=true` → Forces mock mode
- `MOCK_GATEWAY_PORT=3001` → Mock server port

## Success Criteria ✅

- [x] **E2E test passes locally** against live services
- [x] **CI runs mocked variant** reliably without external dependencies
- [x] **Screenshots capture node badges** showing workflow execution status
- [x] **Error handling** gracefully manages network failures
- [x] **Cross-browser support** on major browsers and mobile
- [x] **Documentation** covers local and CI usage

## Troubleshooting

### Common Issues

**Test Timeouts**:

- Increase timeout in test: `{ timeout: 30000 }`
- Check if services are running: `curl http://localhost:8080/health`

**Node Selection Fails**:

- Verify nodes exist: `await expect(page.locator('[data-id="start"]')).toBeVisible()`
- Check React Flow loaded: `await expect(page.locator('.react-flow__pane')).toBeVisible()`

**Mock Gateway Not Starting**:

- Check port availability: `lsof -i :3001`
- Verify dependencies: `pnpm install express cors`

### Debug Mode

```bash
# Run with headed browser and slow motion
pnpm exec playwright test --headed --project=chromium-live --slowMo=1000

# Run single test with debug
pnpm exec playwright test smoke-happy-path.spec.ts --debug
```

## Future Enhancements

- [ ] **Visual regression testing** with screenshot comparison
- [ ] **Performance benchmarks** for workflow execution time
- [ ] **Multi-node workflows** (Start → HTTP → Filter → End)
- [ ] **Template import/export** testing
- [ ] **Collaboration features** when user system is added

---

**Next Steps**: This E2E smoke test establishes the foundation for comprehensive workflow testing as AutomateOS grows toward the full creator ecosystem vision.
