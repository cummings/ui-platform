import { Auth0Client } from "@auth0/nextjs-auth0/server";
import type { PlatformUser } from "@core/sdk";
import { AUTH_ROUTE_PREFIX, getAuthConfig } from "./config";

let client: Auth0Client | undefined;

/**
 * One Auth0 application for the whole platform. Every app constructs the client with the same
 * secret and a root-path cookie, so a session created by the Home app's /auth/callback is
 * readable by every zone behind the gateway.
 */
export function getAuth0(): Auth0Client {
  if (client) return client;
  const config = getAuthConfig();
  const a = config.auth0!;
  client = new Auth0Client({
    domain: a.domain,
    clientId: a.clientId,
    clientSecret: a.clientSecret,
    secret: config.secret,
    appBaseUrl: config.appBaseUrl,
    authorizationParameters: {
      scope: "openid profile email offline_access",
      ...(a.audience ? { audience: a.audience } : {}),
    },
    routes: {
      login: `${AUTH_ROUTE_PREFIX}/login`,
      logout: `${AUTH_ROUTE_PREFIX}/logout`,
      callback: `${AUTH_ROUTE_PREFIX}/callback`,
    },
    session: { cookie: { sameSite: "lax" } },
  });
  return client;
}

export function auth0UserToPlatformUser(user: Record<string, unknown>): PlatformUser {
  const { rolesClaim } = getAuthConfig().auth0!;
  const roles = user[rolesClaim];
  return {
    id: String(user.sub ?? ""),
    name: String(user.name ?? user.email ?? ""),
    email: String(user.email ?? ""),
    picture: typeof user.picture === "string" ? user.picture : undefined,
    roles: Array.isArray(roles) ? roles.map(String) : [],
  };
}
