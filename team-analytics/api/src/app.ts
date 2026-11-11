import Fastify from "fastify";
import { platformAuth, type ServerAuthOptions } from "@core/server-auth";
import { summarize, type OrderLike } from "./summary.js";

export interface AppOptions {
  auth: ServerAuthOptions;
  /** Orders team's API (in-cluster URL). */
  ordersApiUrl: string;
  fetch?: typeof fetch;
}

export async function buildApp({ auth, ordersApiUrl, fetch: doFetch = fetch }: AppOptions) {
  const app = Fastify({
    logger: process.env.NODE_ENV === "test" ? false : { level: process.env.LOG_LEVEL ?? "info" },
    requestIdHeader: "x-request-id",
    genReqId: () => crypto.randomUUID(),
  });

  await app.register(platformAuth, auth);

  app.get("/healthz", async () => ({ status: "ok" }));

  await app.register(
    async (r) => {
      r.get("/summary", { onRequest: app.requireScopes("analytics:read") }, async (req, reply) => {
        // Service-to-service call on the user's behalf: forward their token and the trace id.
        // The Orders API applies its own authorization (orders:read).
        const res = await doFetch(`${ordersApiUrl}/api/orders`, {
          headers: { authorization: `Bearer ${req.principal!.token}`, "x-request-id": req.id, accept: "application/json" },
        });
        if (!res.ok) {
          req.log.warn({ status: res.status }, "orders api call failed");
          return reply.code(res.status === 403 ? 403 : 502).send({ error: "orders_unavailable", upstreamStatus: res.status });
        }
        const { orders } = (await res.json()) as { orders: OrderLike[] };
        return summarize(orders);
      });
    },
    { prefix: "/api/analytics" },
  );

  return app;
}
