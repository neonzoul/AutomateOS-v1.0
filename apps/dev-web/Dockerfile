# Multi-stage Dockerfile for Next.js 14 standalone build

# Stage 1: Builder (combined deps and build)
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package files for monorepo setup
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all necessary package.json files
COPY apps/dev-web/package.json ./apps/dev-web/package.json

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy the entire source code
COPY . .

# Change to the dev-web directory and build
WORKDIR /app/apps/dev-web

# Install dependencies specifically for this app and build
RUN pnpm install && pnpm build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone build
COPY --from=builder /app/apps/dev-web/.next/standalone ./
COPY --from=builder /app/apps/dev-web/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/dev-web/server.js"]