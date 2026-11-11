# core

The platform team's repo: the versioned `@core/*` packages every team app consumes, and the Home
app that owns `/` and sign-in.

| Package | Purpose |
|---|---|
| [`@core/shell`](packages/shell) | Platform chrome: top bar, app launcher (from the gateway registry), nav, user menu, theme |
| [`@core/ui`](packages/ui) | Design system: tokens (CSS variables) + components on Tailwind CSS v4 |
| [`@core/auth`](packages/auth) | Auth0 SSO for Next.js apps (with a mock mode): `createPlatformProxy`, `requireSession` |
| [`@core/sdk`](packages/sdk) | `PlatformProvider`, hooks, typed API client, cross-app event bus, React Query |
| [`@core/server-auth`](packages/server-auth) | Fastify plugin that verifies platform tokens and scopes in team backends |
| [`@core/config`](packages/config) | Shared tsconfig + ESLint |
| [`@core/create-app`](packages/create-app) | `pnpm create @core/app <id>` scaffolds a new team repo |

```bash
pnpm install
pnpm build        # packages
pnpm test && pnpm lint && pnpm typecheck
pnpm changeset    # describe your change (required for every package change)
CORE_REGISTRY_TOKEN=... pnpm release   # version + publish
```

Team-facing docs for every package live in the Home app at **`/docs`** (source: `apps/home/src/app/docs`, MDX). Update them in the same PR as the package change.

See [ARCHITECTURE.md](ARCHITECTURE.md) for how the platform fits together and the rules teams follow.
