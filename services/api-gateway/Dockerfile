FROM node:20-alpine
WORKDIR /service
COPY services/api-gateway/package.json ./
COPY pnpm-workspace.yaml* ./
COPY packages/ ./packages/
RUN npm i -g pnpm && pnpm install --force
COPY services/api-gateway/ ./
EXPOSE 3001
CMD ["npx","tsx","src/index.ts"]