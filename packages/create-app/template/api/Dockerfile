# syntax=docker/dockerfile:1.10
# Build context: repo root.  docker build -f api/Dockerfile --build-arg CORE_REGISTRY=... .
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
ARG CORE_REGISTRY=http://host.docker.internal:4873
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY web/package.json web/
COPY api/package.json api/
RUN --mount=type=secret,id=core_registry_token,env=CORE_REGISTRY_TOKEN \
    sed -i "s#^@core:registry=.*#@core:registry=${CORE_REGISTRY}/#" .npmrc \
 && if [ -n "${CORE_REGISTRY_TOKEN:-}" ]; then echo "//${CORE_REGISTRY#*://}/:_authToken=${CORE_REGISTRY_TOKEN}" >> .npmrc; fi \
 && pnpm install --frozen-lockfile --filter ./api \
 && sed -i '/_authToken/d' .npmrc
COPY api ./api
RUN pnpm --filter ./api build \
 && pnpm --filter ./api deploy --legacy --prod /out \
 && cp -r api/dist /out/dist

FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=4000
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /out ./
USER app
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s CMD wget -qO- http://127.0.0.1:4000/healthz || exit 1
CMD ["node", "dist/server.js"]
