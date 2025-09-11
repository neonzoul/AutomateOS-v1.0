FROM node:20-alpine
WORKDIR /service
COPY services/orchestrator/package.json ./
COPY pnpm-workspace.yaml* ./
COPY packages/ ./packages/
RUN npm i -g pnpm && pnpm install --force
COPY services/orchestrator/ ./
EXPOSE 3002
CMD ["npx","tsx","src/index.ts"]