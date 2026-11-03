import { NextResponse, type NextRequest } from "next/server";
import { getAuth0 } from "./auth0";
import { AUTH_ROUTE_PREFIX, getAuthConfig, SESSION_COOKIE } from "./config";
import { renderMockLoginPage } from "./mock-login-page";
import { MOCK_PERSONAS, signMockToken, verifyMockToken } from "./token";

export interface PlatformProxyOptions {
  /**
   * Only the Home app serves the platform's /auth/* routes (the gateway sends /auth there).
   * Team apps leave this off and redirect signed-out users to it.
   */
  hostsAuthRoutes?: boolean;
  /** Paths (relative to the app's basePath) that don't require a session, e.g. "/healthz". */
  publicPaths?: string[];
}

/**
 * Next.js `proxy` for every platform app: enforces sign-in, hosts /auth/* on the Home app,
 * and forwards `x-request-id` and the original path to Server Components.
 *
 *   // src/proxy.ts
 *   export default createPlatformProxy();
 *   export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
 */
export function createPlatformProxy(options: PlatformProxyOptions = {}) {
  const publicPaths = ["/healthz", ...(options.publicPaths ?? [])];

  return async function proxy(req: NextRequest): Promise<NextResponse> {
    const config = getAuthConfig();
    const { pathname, basePath, search } = req.nextUrl;
    const isAuthRoute = pathname === AUTH_ROUTE_PREFIX || pathname.startsWith(`${AUTH_ROUTE_PREFIX}/`);

    if (options.hostsAuthRoutes && isAuthRoute) {
      return config.mode === "mock" ? handleMockAuthRoute(req, config.secret) : (getAuth0().middleware(req) as Promise<NextResponse>);
    }

    const forwarded = new Headers(req.headers);
    if (!forwarded.get("x-request-id")) forwarded.set("x-request-id", crypto.randomUUID());
    forwarded.set("x-platform-path", `${basePath}${pathname}${search}`);
    const next = () => NextResponse.next({ request: { headers: forwarded } });

    if (publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return next();

    const signedIn =
      config.mode === "mock"
        ? await isValidMockSession(req.cookies.get(SESSION_COOKIE)?.value, config.secret)
        : Boolean(await getAuth0().getSession(req));
    if (signedIn) return next();

    // API-style requests get a 401 instead of an HTML redirect.
    if (req.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    const login = new URL(`${AUTH_ROUTE_PREFIX}/login`, publicOrigin(req));
    login.searchParams.set("returnTo", `${basePath}${pathname}${search}`);
    return NextResponse.redirect(login);
  };
}

async function isValidMockSession(token: string | undefined, secret: string) {
  if (!token) return false;
  try {
    await verifyMockToken(token, secret);
    return true;
  } catch {
    return false;
  }
}

async function handleMockAuthRoute(req: NextRequest, secret: string): Promise<NextResponse> {
  const { pathname, searchParams } = req.nextUrl;
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const origin = publicOrigin(req);

  if (pathname === `${AUTH_ROUTE_PREFIX}/login`) {
    const personaId = searchParams.get("persona");
    if (!personaId) {
      return new NextResponse(renderMockLoginPage(returnTo), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    const persona = MOCK_PERSONAS.find((p) => p.id === personaId);
    if (!persona) return NextResponse.json({ error: "unknown persona" }, { status: 400 });

    const { token, expiresAt } = await signMockToken(persona, secret);
    const res = NextResponse.redirect(new URL(returnTo, origin));
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: origin.startsWith("https://"),
      path: "/",
      expires: new Date(expiresAt * 1000),
    });
    return res;
  }

  if (pathname === `${AUTH_ROUTE_PREFIX}/logout`) {
    const res = NextResponse.redirect(new URL(`${AUTH_ROUTE_PREFIX}/login`, origin));
    res.cookies.delete({ name: SESSION_COOKIE, path: "/" });
    return res;
  }

  return NextResponse.json({ error: "not found" }, { status: 404 });
}

/** Only allow same-origin relative paths, to prevent open redirects. */
function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}

/** The origin the browser used, as reported by the gateway (falls back to the request URL). */
function publicOrigin(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  return host ? `${proto}://${host}` : req.nextUrl.origin;
}
