# syntax=docker/dockerfile:1.10
# Build context: repo root.  docker build -f web/Dockerfile --build-arg CORE_REGISTRY=... .
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
ARG CORE_REGISTRY=http://host.docker.internal:4873
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY web/package.json web/
COPY api/package.json api/
# The registry token (if the registry needs one) is a BuildKit secret: never in a layer.
RUN --mount=type=secret,id=core_registry_token,env=CORE_REGISTRY_TOKEN \
    sed -i "s#^@core:registry=.*#@core:registry=${CORE_REGISTRY}/#" .npmrc \
 && if [ -n "${CORE_REGISTRY_TOKEN:-}" ]; then echo "//${CORE_REGISTRY#*://}/:_authToken=${CORE_REGISTRY_TOKEN}" >> .npmrc; fi \
 && pnpm install --frozen-lockfile --filter ./web \
 && sed -i '/_authToken/d' .npmrc
COPY web ./web
RUN pnpm --filter ./web build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /repo/web/.next/standalone ./
COPY --from=build --chown=app:app /repo/web/.next/static ./web/.next/static
USER app
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/analytics/healthz || exit 1
CMD ["node", "web/server.js"]
