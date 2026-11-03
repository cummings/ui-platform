import { createPlatformProxy } from "@core/auth";

export default createPlatformProxy({ hostsAuthRoutes: true });

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
