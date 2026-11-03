# @core/create-app

Scaffolds a new team repo that is already wired to the platform:

```bash
pnpm create @core/app orders --title Orders --team "Team Orders" --web-port 3101 --api-port 4101 --icon 📦
```

You get a pnpm workspace with `web/` (Next.js under `/<id>`, platform shell, auth, design system)
and `api/` (Fastify under `/api/<id>` with token verification), Dockerfiles, CI, Renovate, and a
`route.yaml` snippet to PR into `platform-gateway/routes.yaml`. `@core/*` versions are pinned to
the latest published at scaffold time.
