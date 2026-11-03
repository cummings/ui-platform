import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { PlatformSession } from "@core/sdk";
import { auth0UserToPlatformUser, getAuth0 } from "./auth0";
import { AUTH_ROUTE_PREFIX, getAuthConfig, SESSION_COOKIE } from "./config";
import { verifyMockToken } from "./token";

/** Current session in a Server Component, Route Handler or Server Action. `null` if signed out. */
export async function getSession(): Promise<PlatformSession | null> {
  const config = getAuthConfig();

  if (config.mode === "mock") {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;
    try {
      const { user, expiresAt } = await verifyMockToken(token, config.secret);
      return { user, accessToken: token, expiresAt };
    } catch {
      return null;
    }
  }

  const auth0 = getAuth0();
  const session = await auth0.getSession();
  if (!session) return null;
  const { token, expiresAt } = await auth0.getAccessToken();
  return { user: auth0UserToPlatformUser(session.user), accessToken: token, expiresAt };
}

/** Like getSession, but redirects to the platform login (and back) when signed out. */
export async function requireSession(): Promise<PlatformSession> {
  const session = await getSession();
  if (session) return session;
  const h = await headers();
  const returnTo = h.get("x-platform-path") ?? "/";
  redirect(`${AUTH_ROUTE_PREFIX}/login?returnTo=${encodeURIComponent(returnTo)}`);
}

/** Request id assigned by the gateway (or by the platform proxy), for tracing API calls. */
export async function getRequestId(): Promise<string | undefined> {
  return (await headers()).get("x-request-id") ?? undefined;
}
