import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "./api-client";

describe("createApiClient", () => {
  it("sends bearer token and request id, parses JSON", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const api = createApiClient({ baseUrl: "http://api/", getToken: () => "t0k", requestId: "req-1", fetch: fetchMock });

    await expect(api.get("/things")).resolves.toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(url).toBe("http://api/things");
    expect(headers.get("authorization")).toBe("Bearer t0k");
    expect(headers.get("x-request-id")).toBe("req-1");
  });

  it("throws ApiError with status and body", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ error: "nope" }), { status: 403 }));
    const api = createApiClient({ baseUrl: "http://api", fetch: fetchMock });
    await expect(api.post("/x", { a: 1 })).rejects.toMatchObject({ status: 403, body: { error: "nope" } });
    await expect(api.post("/x")).rejects.toBeInstanceOf(ApiError);
  });

  it("supports PATCH with a JSON body", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: 1 }), { status: 200 }));
    const api = createApiClient({ baseUrl: "http://api", fetch: fetchMock });
    await api.patch("/x/1", { status: "paid" });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.method).toBe("PATCH");
    expect(init.body).toBe(JSON.stringify({ status: "paid" }));
  });
});
