import { serverAuthOptionsFromEnv } from "@core/server-auth";
import { buildApp } from "./app.js";

const app = await buildApp({
  auth: serverAuthOptionsFromEnv(),
  ordersApiUrl: process.env.ORDERS_API_URL ?? "http://localhost:4101",
});
await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 4000) });
