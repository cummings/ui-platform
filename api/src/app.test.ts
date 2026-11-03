import { describe, expect, it } from "vitest";
import { createTestToken } from "@core/server-auth/testing";
import { buildApp } from "./app.js";

const secret = "t".repeat(40);
const auth = (token: string) => ({ authorization: `Bearer ${token}` });

describe("orders api", () => {
  it("requires a platform token", async () => {
    const app = await buildApp({ mode: "mock", secret });
    expect((await app.inject({ url: "/api/orders" })).statusCode).toBe(401);
  });

  it("lists orders with orders:read", async () => {
    const app = await buildApp({ mode: "mock", secret });
    const token = await createTestToken(secret, { scopes: ["orders:read"] });
    const res = await app.inject({ url: "/api/orders?status=paid", headers: auth(token) });
    expect(res.statusCode).toBe(200);
    expect(res.json().orders.every((o: { status: string }) => o.status === "paid")).toBe(true);
  });

  it("forbids creating without orders:write", async () => {
    const app = await buildApp({ mode: "mock", secret });
    const token = await createTestToken(secret, { scopes: ["orders:read"] });
    const res = await app.inject({ method: "POST", url: "/api/orders", headers: auth(token), payload: {} });
    expect(res.statusCode).toBe(403);
  });

  it("creates an order and computes the total", async () => {
    const app = await buildApp({ mode: "mock", secret });
    const token = await createTestToken(secret, { sub: "mock|alice", scopes: ["orders:read", "orders:write"] });
    const res = await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: auth(token),
      payload: { customer: "Acme", lines: [{ sku: "A", description: "Thing", quantity: 3, unitPrice: 9.99 }] },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ customer: "Acme", total: 29.97, status: "pending", createdBy: "mock|alice" });
  });
});
