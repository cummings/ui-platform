import { serverAuthOptionsFromEnv } from "@core/server-auth";
import { buildApp } from "./app.js";

const app = await buildApp(serverAuthOptionsFromEnv());
await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 4000) });
