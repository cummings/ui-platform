import { describe, expect, it } from "vitest";
import { createTestToken } from "@core/server-auth/testing";
import { buildApp } from "./app.js";

const secret = "t".repeat(40);

describe("__APP_ID__ api", () => {
  it("requires a platform token", async () => {
    const app = await buildApp({ mode: "mock", secret });
    expect((await app.inject({ url: "__API_PATH__/items" })).statusCode).toBe(401);
  });

  it("returns items for a signed-in user", async () => {
    const app = await buildApp({ mode: "mock", secret });
    const token = await createTestToken(secret);
    const res = await app.inject({ url: "__API_PATH__/items", headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
    expect(res.json().items.length).toBeGreaterThan(0);
  });
});
