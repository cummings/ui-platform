import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { MOCK_PERSONAS, signMockToken } from "@core/auth/token";
import { platformAuth } from "./index";

const secret = "s".repeat(40);

async function buildApp() {
  const app = Fastify();
  await app.register(platformAuth, { mode: "mock", secret });
  app.get("/me", { onRequest: app.authenticate }, async (req) => ({ sub: req.principal!.sub }));
  app.post("/write", { onRequest: app.requireScopes("orders:write") }, async () => ({ ok: true }));
  return app;
}

describe("platformAuth (mock mode)", () => {
  it("401s without a token", async () => {
    const app = await buildApp();
    expect((await app.inject({ url: "/me" })).statusCode).toBe(401);
  });

  it("accepts tokens minted by @core/auth", async () => {
    const app = await buildApp();
    const { token } = await signMockToken(MOCK_PERSONAS[0]!, secret);
    const res = await app.inject({ url: "/me", headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ sub: "mock|alice" });
  });

  it("403s when a scope is missing", async () => {
    const app = await buildApp();
    const { token } = await signMockToken(MOCK_PERSONAS[1]!, secret); // Bob: read-only
    const res = await app.inject({ method: "POST", url: "/write", headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(403);
    expect(res.json()).toMatchObject({ missingScopes: ["orders:write"] });
  });
});

describe("createTestToken", () => {
  it("mints tokens the plugin accepts", async () => {
    const { createTestToken } = await import("./testing");
    const app = await buildApp();
    const token = await createTestToken(secret, { sub: "test|1", scopes: ["orders:write"] });
    const res = await app.inject({ method: "POST", url: "/write", headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
  });
});
