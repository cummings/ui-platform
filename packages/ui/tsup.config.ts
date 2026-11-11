import { defineConfig } from "tsup";

const external = ["react", "react-dom", "@core/ui/client"];

export default defineConfig([
  // Server-safe entry. No "use client": Server Components can pass functions (e.g. Table cells).
  { entry: { index: "src/index.ts" }, format: ["esm"], dts: true, clean: true, target: "es2022", external },
  // Interactive components behind a client boundary.
  { entry: { client: "src/client.ts" }, format: ["esm"], dts: true, target: "es2022", external, banner: { js: '"use client";' } },
]);
