# @core/auth

Single sign-on for every platform app.

| `AUTH_MODE` | Behaviour |
|---|---|
| `auth0` | One Auth0 tenant + application. The Home app serves `/auth/login`, `/auth/callback`, `/auth/logout`. Every app uses the **same `AUTH_SECRET`**, so the root-path session cookie is readable in every zone. |
| `mock` (default) | Local persona picker at `/auth/login`; the session cookie is an HS256 JWT shaped like an Auth0 access token. Refused when `PLATFORM_ENV=production`. |

```ts
// src/proxy.ts (every app; Home passes { hostsAuthRoutes: true })
import { createPlatformProxy } from "@core/auth";
export default createPlatformProxy();
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
```

```ts
// Server Component / Server Action
const session = await requireSession(); // { user, accessToken, expiresAt }
```

Env: `AUTH_MODE`, `AUTH_SECRET` (≥32 chars, shared), `APP_BASE_URL`, and for Auth0 `AUTH0_DOMAIN`,
`AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_AUDIENCE`, `AUTH0_ROLES_CLAIM`.

Access tokens never reach the browser: call APIs from the server (Server Components, Server
Actions, Route Handlers) with `session.accessToken`.
