import path from "node:path";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const config: NextConfig = {
  // Home owns "/" (including the developer docs at /docs) and the platform's /auth/* routes; no basePath.
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  poweredByHeader: false,
  pageExtensions: ["ts", "tsx", "mdx"],
};

// Plugins are given by name so the config stays serializable for Turbopack.
const withMDX = createMDX({ options: { remarkPlugins: [["remark-gfm", {}]] } });

export default withMDX(config);
