import { createPlatformProxy } from "@core/auth";

// Signed-out users are sent to the platform's /auth/login and returned here afterwards.
export default createPlatformProxy();

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
