# Analytics (Team Analytics)

A team app on the Core Platform, mounted at **`/analytics`** behind the platform gateway.

| Part | Dev URL | Behind gateway |
|---|---|---|
| `web/` Next.js | http://localhost:3102/analytics | `/analytics/*` |
| `api/` Fastify | http://localhost:4102/api/analytics | `/api/analytics/*` |

## Develop

```bash
pnpm install          # @core/* from the platform registry (see .npmrc)
pnpm dev              # web + api
```

Sign-in lives on the platform Home app, so open the app **through the gateway** while developing:
run the gateway with `UPSTREAMS=dev` (see platform-gateway README). It then proxies
`/analytics` to your laptop's `:3102`.

## What the platform gives you

Full guides and API reference: **`/docs`** on the platform (locally http://localhost:8080/docs).


- `@core/shell`: the platform chrome (`src/components/AppShell.tsx`)
- `@core/ui`: the design system
- `@core/auth`: sign-in enforcement (`src/proxy.ts`) and `requireSession()`
- `@core/sdk`: `PlatformProvider`, hooks, `createApiClient`, cross-app events
- `@core/server-auth`: bearer-token verification and scopes for `api/`

## Rules of the road

- Serve everything under `/analytics` (web) and `/api/analytics` (api). The gateway never rewrites paths.
- Call your API from the server (Server Components / Actions / Route Handlers) with the session token.
  Access tokens never go to the browser.
- Upgrade `@core/*` through Renovate PRs. Minor and patch updates are non-breaking by contract.
- Change routes only by PR to `platform-gateway/routes.yaml` (copy `route.yaml`).
