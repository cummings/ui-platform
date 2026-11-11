# UI Platform workspace

Four **independent Git repositories** that together form one product. They sit side by side here
only for local development.

| Repo | Owner | What it is |
|---|---|---|
| [`core/`](core) | Platform team | `@core/*` npm packages (shell, ui, auth, sdk, server-auth, config, create-app) and the Home app at `/` |
| [`platform-gateway/`](platform-gateway) | Platform team | Nginx edge router, `routes.yaml` route registry, local Verdaccio registry, docker compose for the whole platform |
| [`team-orders/`](team-orders) | Team Orders | `/orders` web app + `/api/orders` service |
| [`team-analytics/`](team-analytics) | Team Analytics | `/analytics` web app + `/api/analytics` service |

Start with [`core/ARCHITECTURE.md`](core/ARCHITECTURE.md). To run everything, see the
[`platform-gateway/` README](platform-gateway/README.md).
