import path from "node:path";
import type { NextConfig } from "next";

const config: NextConfig = {
  // Home owns "/" and the platform's /auth/* routes; no basePath.
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  poweredByHeader: false,
};

export default config;
