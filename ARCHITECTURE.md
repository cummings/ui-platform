# Core Platform architecture

**One product, many team apps.** Independent teams build, test and deploy their own apps from
their own repos. Users experience one platform: one domain, one sign-in, one look and feel.

## Building blocks

| Concern | Owned by | Mechanism |
|---|---|---|
| Routing | Platform (`platform-gateway`) | Nginx path routing from `routes.yaml`; `/<app>/*` → app, `/api/<app>/*` → app API |
| Chrome, look & feel | Platform (`@core/shell`, `@core/ui`) | npm packages, semver, Tailwind v4 tokens |
| Identity | Platform (`@core/auth`, `@core/server-auth`) | One Auth0 tenant + application; shared root-path session cookie |
| Shared runtime context | Platform (`@core/sdk`) | `PlatformProvider` (user, apps, flags), hooks, API client, events |
| Features, pages, backends | Each team | Their own repo, CI/CD, Docker images, release cadence |

Each team app is a **Next.js zone**: a separate Next.js app with `basePath: "/<app>"`. Navigation
*within* an app is client-side. Navigation *between* apps is a full page load. That's the price of
true deploy independence, and it's barely noticeable because the chrome renders the same way
everywhere.

## Request flow

1. The browser requests `/orders/123`. The gateway forwards it untouched to `orders-web`.
2. The app's `proxy.ts` (`createPlatformProxy`) checks the session cookie. Signed-out users are
   redirected to `/auth/login?returnTo=/orders/123`, which is served by the **Home** app.
3. Home completes the login (Auth0, or the mock persona picker) and sets the session cookie on `path=/`.
   Every app reads that cookie, because they all share `AUTH_SECRET` and the same Auth0 application.
4. The page's Server Components call `requireSession()`, then call the team API **server-side**
   with `session.accessToken` (`createApiClient`). Access tokens never reach the browser.
   Client-side data goes through the app's own route handlers (backend-for-frontend).
5. The API verifies the token with `@core/server-auth` (`onRequest: app.requireScopes(...)`).
   Calls between services forward the user's token and `x-request-id`.

## Auth model

- **Roles** (`user.roles`, from the Auth0 roles claim) drive UI decisions, such as hiding "New order".
- **Scopes/permissions** on the access token (`orders:read`, `orders:write`, `analytics:read`)
  drive API authorization. The API is always the enforcement point; the UI only hides things.
- `AUTH_MODE=mock` mints HS256 tokens shaped like Auth0's, with two personas, so the same code
  paths run locally. Both libraries refuse mock mode when `PLATFORM_ENV=production`.
- Auth0 setup: one Regular Web Application (callback `https://<host>/auth/callback`), one API
  (audience) with RBAC permissions enabled, and an Action that adds roles to the
  `https://platform.company.com/roles` claim.
  > The Auth0 path is wired (`@auth0/nextjs-auth0` v4) but hasn't been exercised against a real
  > tenant in this repo yet. Validate it before going live.

## Cross-app events

`@core/sdk` provides a typed event bus. It delivers to the current window and, through
`BroadcastChannel`, to other platform tabs. The publisher declares the event shape, and each
consumer declares the same shape. Treat these as public contracts, versioned like an API.

```ts
declare module "@core/sdk" {
  interface PlatformEventMap { "orders.created": { id: string; customer: string; total: number } }
}
events.emit("orders.created", payload);           // Orders
usePlatformEvent("orders.created", (e) => ...);   // Analytics
```

Events are for UI freshness only. Anything that must be durable belongs in backend messaging.

## Versioning contract

- Every change to a published package ships with a **changeset**. Changesets versions dependents
  and writes changelogs.
- While packages are `0.x`, a **minor is treated as breaking** (`^0.1.0` won't pick up `0.2.0`).
  Teams opt in by upgrading. Move to `1.0.0` once the APIs settle.
- `react`, `react-dom`, `next` and `tailwindcss` are **peer dependencies**. The platform supports
  one major of each at a time.
- `@core/sdk` holds React context. Other `@core` packages import only its *types*, so duplicate
  copies can never split context.
- Teams receive upgrades through Renovate (grouped; minor and patch auto-merge when CI is green).
  Different apps can run different `@core` versions at the same time: Orders runs
  `@core/sdk@0.2` while Analytics stays on `0.1`.
- Packages expose public entry points only (`@core/ui`, `@core/ui/client`, `@core/shell/server`,
  …). The shared ESLint config forbids deep imports.

## Onboarding a new team

1. `pnpm create @core/app inventory --title Inventory --team "Team Inventory" --web-port 3103 --api-port 4103`
2. `cd team-inventory && git init && pnpm install && pnpm dev`
3. PR the generated `route.yaml` entry into `platform-gateway/routes.yaml`.
4. Set up CI (`.github/workflows/ci.yml` is included) and deploy `web` and `api` images.
   The gateway picks up the route, and the launcher lists the app on its next refresh.

## Rules of the road for team apps

- Serve only under your `basePath` and `/api/<id>`, and never rely on gateway rewrites.
- Wrap your root layout in `PlatformProvider` and `PlatformShell`. Use `@core/ui` before building
  your own components.
- Call APIs from the server with the session token. Keep tokens out of client components.
- Authorize in the API with scopes (`onRequest` hooks, so checks run before body validation).
- Use full `<a>` links to other apps and `next/link` inside your own.
- Ship an `app/error.tsx` boundary (the template includes one) so outages degrade inside the chrome.

## Decisions to revisit

- **Package scope.** `@core` is a placeholder. Use your org's scope on the real registry, and never
  proxy that scope to public npm (dependency confusion).
- **CSP.** The gateway sets the baseline headers. Script and style CSP with nonces belongs in each
  Next.js app.
- **Observability.** `x-request-id` flows end to end. OpenTelemetry is the next step.
- **Kubernetes.** Generate an Ingress/HTTPRoute from `routes.yaml` instead of Nginx config.
