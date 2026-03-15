FROM node:22-alpine AS builder
WORKDIR /app

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Install and build in SSR mode (not static export)
RUN npm install -g pnpm@10 && \
    pnpm install --frozen-lockfile

# Override next.config to remove static export for SSR
RUN sed -i 's/output: "export",/\/\/ output: "export", \/\/ disabled for Cloud Run SSR/' apps/web/next.config.ts

ENV NEXT_PUBLIC_API_MODE=api
ENV NEXT_PUBLIC_API_URL=https://uniflo-api-PLACEHOLDER.run.app

RUN pnpm --filter=@uniflo/web build

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
EXPOSE 8080
CMD ["node", "apps/web/server.js"]
