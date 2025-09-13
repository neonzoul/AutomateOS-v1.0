FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm i -g pnpm && pnpm install --prod --ignore-scripts || true
COPY . .
EXPOSE 8082
CMD ["node","server.js"]
