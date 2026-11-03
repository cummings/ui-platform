import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", token: "src/token.ts" },
  format: ["esm"],
  dts: true,
  clean: true,
  target: "es2022",
  external: ["next", "@auth0/nextjs-auth0", "@core/sdk"],
});
