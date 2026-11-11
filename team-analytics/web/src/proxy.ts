import { createPlatformProxy } from "@core/auth";

// Signed-out users are sent to the platform's /auth/login and returned here afterwards.
export default createPlatformProxy();

export const config = {
  // "/" is listed explicitly: with a basePath, the bare app root (e.g. /orders) doesn't match the second pattern.
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
