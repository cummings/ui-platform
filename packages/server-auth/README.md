# @core/server-auth

Fastify plugin for team backends. Verifies the same tokens the web apps hold — Auth0 access
tokens (RS256 via the tenant JWKS) or mock-mode tokens (HS256) — using the same env variables.

```ts
import { platformAuth, serverAuthOptionsFromEnv } from "@core/server-auth";

await app.register(platformAuth, serverAuthOptionsFromEnv());
app.get("/api/orders", { onRequest: app.requireScopes("orders:read") }, async (req) => {
  req.principal; // { sub, roles, scopes, token, ... }
});
```

### Testing

```ts
import { createTestToken } from "@core/server-auth/testing";
const token = await createTestToken(secret, { scopes: ["orders:read"] });
await app.inject({ url: "/api/orders", headers: { authorization: `Bearer ${token}` } });
```
