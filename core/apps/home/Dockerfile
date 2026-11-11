# Build context: the core repo root.  docker build -f apps/home/Dockerfile .
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY packages ./packages
COPY apps/home ./apps/home
RUN pnpm install --frozen-lockfile --filter home...
RUN pnpm --filter "home^..." build && pnpm --filter home build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /repo/apps/home/.next/standalone ./
COPY --from=build --chown=app:app /repo/apps/home/.next/static ./apps/home/.next/static
USER app
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "apps/home/server.js"]
