# Apps

Frontend applications built with Next.js.

## Structure

- `dev-web/` - AutomateOS.dev Creator Studio (Workflow Builder, Profiles, Publishing)
- `app-web/` - AutomateOS.app User Dashboard (Gallery, Usage, SaaS)

## Development

```bash
# Start all apps
pnpm dev

# Start specific app
pnpm -C apps/dev-web dev
pnpm -C apps/app-web dev
```

Each app is configured with:
- Next.js with TypeScript
- Tailwind CSS + shadcn/ui
- `output: 'standalone'` for containerization
- Shared UI components from `@automateos/ui`
