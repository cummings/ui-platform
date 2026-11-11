import Fastify from "fastify";
import { platformAuth, type ServerAuthOptions } from "@core/server-auth";
import { createStore, ORDER_STATUSES, type OrderStatus } from "./store.js";

export async function buildApp(auth: ServerAuthOptions) {
  const app = Fastify({
    logger: process.env.NODE_ENV === "test" ? false : { level: process.env.LOG_LEVEL ?? "info" },
    // Reuse the gateway's request id for end-to-end tracing.
    requestIdHeader: "x-request-id",
    genReqId: () => crypto.randomUUID(),
  });

  await app.register(platformAuth, auth);
  const store = createStore();

  app.get("/healthz", async () => ({ status: "ok" }));

  // Every route lives under the agreed prefix; the gateway forwards paths untouched.
  await app.register(
    async (r) => {
      r.get<{ Querystring: { status?: OrderStatus } }>(
        "/",
        {
          onRequest: app.requireScopes("orders:read"),
          schema: { querystring: { type: "object", properties: { status: { type: "string", enum: ORDER_STATUSES } } } },
        },
        async (req) => ({ orders: store.list(req.query.status) }),
      );

      r.get<{ Params: { id: string } }>("/:id", { onRequest: app.requireScopes("orders:read") }, async (req, reply) => {
        const order = store.get(req.params.id);
        return order ?? reply.code(404).send({ error: "not_found" });
      });

      r.post<{ Body: { customer: string; lines: { sku: string; description: string; quantity: number; unitPrice: number }[] } }>(
        "/",
        {
          onRequest: app.requireScopes("orders:write"),
          schema: {
            body: {
              type: "object",
              required: ["customer", "lines"],
              properties: {
                customer: { type: "string", minLength: 2, maxLength: 120 },
                lines: {
                  type: "array",
                  minItems: 1,
                  items: {
                    type: "object",
                    required: ["sku", "description", "quantity", "unitPrice"],
                    properties: {
                      sku: { type: "string", minLength: 1 },
                      description: { type: "string", minLength: 1 },
                      quantity: { type: "integer", minimum: 1 },
                      unitPrice: { type: "number", minimum: 0 },
                    },
                  },
                },
              },
            },
          },
        },
        async (req, reply) => {
          const order = store.create({ ...req.body, status: "pending", createdBy: req.principal!.sub });
          req.log.info({ orderId: order.id, by: req.principal!.sub }, "order created");
          return reply.code(201).send(order);
        },
      );

      r.patch<{ Params: { id: string }; Body: { status: OrderStatus } }>(
        "/:id/status",
        {
          onRequest: app.requireScopes("orders:write"),
          schema: { body: { type: "object", required: ["status"], properties: { status: { type: "string", enum: ORDER_STATUSES } } } },
        },
        async (req, reply) => {
          const order = store.setStatus(req.params.id, req.body.status);
          return order ?? reply.code(404).send({ error: "not_found" });
        },
      );
    },
    { prefix: "/api/orders" },
  );

  return app;
}
