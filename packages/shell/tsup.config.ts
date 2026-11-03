import { defineConfig } from "tsup";

const external = ["react", "react-dom", "@core/sdk", "@core/ui"];

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: true,
    clean: true,
    target: "es2022",
    external,
    banner: { js: '"use client";' },
  },
  { entry: { server: "src/server.ts" }, format: ["esm"], dts: true, target: "es2022", external },
]);
