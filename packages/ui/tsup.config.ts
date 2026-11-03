import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  clean: true,
  target: "es2022",
  external: ["react", "react-dom"],
  // Components are interactive; mark the whole package as a client boundary so it works
  // from React Server Components without each app adding wrappers.
  banner: { js: '"use client";' },
});
