import { createPlatformProxy } from "@core/auth";

export default createPlatformProxy({ hostsAuthRoutes: true });

export const config = {
  // "/" is listed explicitly: with a basePath, the bare app root (e.g. /orders) doesn't match the second pattern.
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
