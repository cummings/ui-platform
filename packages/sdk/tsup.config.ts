import { defineConfig } from "tsup";

export default defineConfig([
  // Isomorphic: types, API client, event contracts. Safe in server components and Node.
  { entry: { index: "src/index.ts" }, format: ["esm"], dts: true, clean: true, target: "es2022" },
  // React context + hooks. Marked as a client boundary.
  {
    entry: { client: "src/client.tsx" },
    format: ["esm"],
    dts: true,
    target: "es2022",
    external: ["react", "@tanstack/react-query", "@core/sdk"],
    banner: { js: '"use client";' },
  },
]);
