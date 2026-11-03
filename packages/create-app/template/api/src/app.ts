import Fastify from "fastify";
import { platformAuth, type ServerAuthOptions } from "@core/server-auth";

export interface Item {
  id: string;
  name: string;
}

export async function buildApp(auth: ServerAuthOptions) {
  const app = Fastify({
    logger: process.env.NODE_ENV === "test" ? false : { level: process.env.LOG_LEVEL ?? "info" },
    // Reuse the gateway's request id for end-to-end tracing.
    requestIdHeader: "x-request-id",
    genReqId: () => crypto.randomUUID(),
  });

  await app.register(platformAuth, auth);

  const items: Item[] = [
    { id: "1", name: "First item" },
    { id: "2", name: "Second item" },
  ];

  app.get("/healthz", async () => ({ status: "ok" }));

  // Every route lives under the agreed prefix; the gateway forwards paths untouched.
  await app.register(
    async (r) => {
      r.get("/items", { onRequest: app.authenticate }, async () => ({ items }));
    },
    { prefix: "__API_PATH__" },
  );

  return app;
}
