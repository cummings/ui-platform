import path from "node:path";
import type { NextConfig } from "next";

const config: NextConfig = {
  // The agreed platform route. Must match platform-gateway/routes.yaml.
  basePath: "__BASE_PATH__",
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, ".."),
  poweredByHeader: false,
};

export default config;
