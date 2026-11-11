import { describe, expect, it, vi } from "vitest";
import { createTestToken } from "@core/server-auth/testing";
import { buildApp } from "./app.js";
import { summarize } from "./summary.js";

const secret = "t".repeat(40);
const orders = [
  { id: "1", customer: "A", status: "paid", total: 100, createdAt: new Date().toISOString() },
  { id: "2", customer: "B", status: "cancelled", total: 50, createdAt: new Date().toISOString() },
  { id: "3", customer: "A", status: "shipped", total: 20, createdAt: new Date().toISOString() },
];

describe("summarize", () => {
  it("excludes cancelled orders from revenue", () => {
    const s = summarize(orders);
    expect(s).toMatchObject({ orderCount: 2, revenue: 120, averageOrderValue: 60, byStatus: { paid: 1, cancelled: 1, shipped: 1 } });
    expect(s.topCustomers[0]).toEqual({ customer: "A", revenue: 120, orders: 2 });
  });
});

describe("analytics api", () => {
  it("forwards the caller's token to the orders api", async () => {
    const fetchMock = vi.fn(async () => Response.json({ orders }));
    const app = await buildApp({ auth: { mode: "mock", secret }, ordersApiUrl: "http://orders", fetch: fetchMock });
    const token = await createTestToken(secret, { scopes: ["analytics:read"] });

    const res = await app.inject({ url: "/api/analytics/summary", headers: { authorization: `Bearer ${token}` } });

    expect(res.statusCode).toBe(200);
    expect(res.json().revenue).toBe(120);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://orders/api/orders");
    expect((init.headers as Record<string, string>).authorization).toBe(`Bearer ${token}`);
  });

  it("requires analytics:read", async () => {
    const app = await buildApp({ auth: { mode: "mock", secret }, ordersApiUrl: "http://orders", fetch: vi.fn() });
    const token = await createTestToken(secret, { scopes: ["orders:read"] });
    const res = await app.inject({ url: "/api/analytics/summary", headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(403);
  });
});
