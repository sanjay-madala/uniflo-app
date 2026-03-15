FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/db ./packages/db
COPY apps/api ./apps/api

RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm --filter=@uniflo/api build

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db ./packages/db

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/server.js"]
