# __APP_TITLE__ (__TEAM__)

A team app on the Core Platform, mounted at **`__BASE_PATH__`** behind the platform gateway.

| Part | Dev URL | Behind gateway |
|---|---|---|
| `web/` Next.js | http://localhost:__WEB_DEV_PORT____BASE_PATH__ | `__BASE_PATH__/*` |
| `api/` Fastify | http://localhost:__API_DEV_PORT____API_PATH__ | `__API_PATH__/*` |

## Develop

```bash
pnpm install          # @core/* from the platform registry (see .npmrc)
pnpm dev              # web + api
```

Sign-in lives on the platform Home app, so open the app **through the gateway** while developing:
run the gateway with `UPSTREAMS=dev` (see platform-gateway README). It then proxies
`__BASE_PATH__` to your laptop's `:__WEB_DEV_PORT__`.

## What the platform gives you

- `@core/shell`: the platform chrome (`src/components/AppShell.tsx`)
- `@core/ui`: the design system
- `@core/auth`: sign-in enforcement (`src/proxy.ts`) and `requireSession()`
- `@core/sdk`: `PlatformProvider`, hooks, `createApiClient`, cross-app events
- `@core/server-auth`: bearer-token verification and scopes for `api/`

## Rules of the road

- Serve everything under `__BASE_PATH__` (web) and `__API_PATH__` (api). The gateway never rewrites paths.
- Call your API from the server (Server Components / Actions / Route Handlers) with the session token.
  Access tokens never go to the browser.
- Upgrade `@core/*` through Renovate PRs. Minor and patch updates are non-breaking by contract.
- Change routes only by PR to `platform-gateway/routes.yaml` (copy `route.yaml`).
