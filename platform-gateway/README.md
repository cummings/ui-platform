# platform-gateway

The platform's edge: one Nginx that routes `platform.company.com/<app>/…` to independently
deployed apps, the **route registry** teams PR into, and a docker compose file that runs the whole
platform locally.

```
Browser ─► gateway (Nginx, :8080)
            ├─ /api/<app>/*   → <app>-api     (team backend)
            ├─ /<app>/*       → <app>-web     (team Next.js app, basePath /<app>)
            ├─ /auth/*        → home          (platform sign-in, Auth0 or mock)
            ├─ /platform/*    → static        (apps.json registry, error pages)
            └─ /*             → home
```

## Run the whole platform

Prereqs: Docker, Node 22, pnpm 10.

```bash
cp .env.example .env
pnpm install
docker compose --profile registry up -d registry      # private npm registry on :4873
```

Publish the platform packages (first time, or after core changes):

```bash
cd ../core && pnpm install
CORE_REGISTRY_TOKEN=$(sh ../platform-gateway/scripts/registry-token.sh) pnpm release
```

Then build and start every app:

```bash
docker compose up -d --build
```

Open http://localhost:8080 and pick a persona. **Alice** can create orders. **Bob** is read-only.

## Develop one app against the real platform

Run the gateway (and anything you're not working on) in Docker, and your app on your laptop:

```bash
UPSTREAMS=dev docker compose up -d gateway home
cd ../team-orders && pnpm dev        # web :3101, api :4101
```

`upstreams/dev.env` points each route at `host.docker.internal:<devPort>`.

## Routes are a contract: `routes.yaml`

- Teams add or change routes by PR to `routes.yaml`. The platform team reviews.
- `pnpm generate` validates it and writes `nginx/templates/routes.conf.template`, `public/apps.json`
  (the launcher's registry) and `upstreams/*.env`. CI runs `pnpm check` to reject stale output.
- Validation enforces unique ids, `basePath: /<id>`, `api.path: /api/<id>`, and reserved prefixes
  (`/platform`, `/healthz`, `/_next`, `/api`). Only the root app may claim extra paths (`/auth`).

## Behaviour baked into the gateway

- **No path rewriting.** Apps serve under their own prefix, so assets, links and redirects just work.
- **Resilience.** Upstreams resolve per request, so one app being down never blocks the gateway
  from starting. A failed web app shows `/platform/unavailable.html`, and a failed API returns a
  JSON 503 with the request id.
- **Tracing.** `X-Request-ID` is honoured or generated, forwarded to apps (which forward it to
  APIs) and echoed in the response and in the JSON access log.
- **Headers.** nosniff, a referrer policy, frame-ancestors/`X-Frame-Options`, a permissions policy,
  and gzip. Add HSTS once TLS terminates here.
- **Non-root** container with a health check.

In Kubernetes the same `routes.yaml` can generate Ingress/HTTPRoute objects instead, and the apps
don't change.
