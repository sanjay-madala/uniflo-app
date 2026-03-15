FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/db/ ./packages/db/
COPY packages/mock-data/ ./packages/mock-data/
COPY packages/config/ ./packages/config/
COPY apps/api/ ./apps/api/

RUN npm install -g pnpm@10 && pnpm install --frozen-lockfile

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/ ./
RUN npm install -g tsx

# Copy Firebase SA key (for auth verification)
COPY apps/api/firebase-sa.json /app/firebase-sa.json

ENV NODE_ENV=production
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/firebase-sa.json
EXPOSE 8080
WORKDIR /app/apps/api
CMD ["tsx", "src/server.ts"]
