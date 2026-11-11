export type AuthMode = "auth0" | "mock";

export const SESSION_COOKIE = "__platform_session";
export const AUTH_ROUTE_PREFIX = "/auth";

const DEV_SECRET = "core-platform-mock-secret-local-dev-only-0000";

export interface AuthConfig {
  mode: AuthMode;
  /** Mock: HS256 signing key. Auth0: cookie encryption secret (must be identical in every app). */
  secret: string;
  /** Public origin of the platform, e.g. https://platform.company.com. */
  appBaseUrl: string;
  auth0?: {
    domain: string;
    clientId: string;
    clientSecret: string;
    audience?: string;
    rolesClaim: string;
  };
}

let cached: AuthConfig | undefined;

export function getAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig {
  if (cached && env === process.env) return cached;

  const mode = (env.AUTH_MODE ?? "mock") as AuthMode;
  if (mode !== "mock" && mode !== "auth0") throw new Error(`AUTH_MODE must be "mock" or "auth0", got "${mode}"`);
  if (mode === "mock" && env.PLATFORM_ENV === "production") {
    throw new Error("AUTH_MODE=mock is not allowed when PLATFORM_ENV=production");
  }

  let secret = env.AUTH_SECRET ?? "";
  if (!secret && mode === "mock") {
    console.warn("[@core/auth] AUTH_SECRET not set — using the built-in local dev secret.");
    secret = DEV_SECRET;
  }
  if (secret.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters");

  const config: AuthConfig = {
    mode,
    secret,
    appBaseUrl: env.APP_BASE_URL ?? "http://localhost:8080",
  };

  if (mode === "auth0") {
    const required = ["AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET"] as const;
    const missing = required.filter((k) => !env[k]);
    if (missing.length) throw new Error(`AUTH_MODE=auth0 requires ${missing.join(", ")}`);
    config.auth0 = {
      domain: env.AUTH0_DOMAIN!,
      clientId: env.AUTH0_CLIENT_ID!,
      clientSecret: env.AUTH0_CLIENT_SECRET!,
      audience: env.AUTH0_AUDIENCE,
      rolesClaim: env.AUTH0_ROLES_CLAIM ?? "https://platform.company.com/roles",
    };
  }

  if (env === process.env) cached = config;
  return config;
}
