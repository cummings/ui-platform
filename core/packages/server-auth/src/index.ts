import fp from "fastify-plugin";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import type { FastifyPluginAsync, FastifyReply, FastifyRequest, preHandlerAsyncHookHandler } from "fastify";

// Must match @core/auth/token (verified by src/index.test.ts).
export const MOCK_ISSUER = "urn:core-platform:mock";
export const MOCK_AUDIENCE = "urn:core-platform:api";

export interface PlatformPrincipal {
  sub: string;
  name?: string;
  email?: string;
  roles: string[];
  scopes: string[];
  claims: JWTPayload;
  /** The raw bearer token, for calling downstream platform services on the user's behalf. */
  token: string;
}

export type ServerAuthOptions =
  | { mode: "mock"; secret: string }
  | { mode: "auth0"; domain: string; audience: string; rolesClaim?: string };

declare module "fastify" {
  interface FastifyRequest {
    principal?: PlatformPrincipal;
  }
  interface FastifyInstance {
    /** Hook (use as `onRequest`, so auth runs before body parsing): 401 unless a valid platform token is present. */
    authenticate: preHandlerAsyncHookHandler;
    /** Hook factory (use as `onRequest`): 403 unless the token carries every listed scope. */
    requireScopes: (...scopes: string[]) => preHandlerAsyncHookHandler;
  }
}

/** Read AUTH_MODE / AUTH_SECRET / AUTH0_* from env — the same variables the web apps use. */
export function serverAuthOptionsFromEnv(env: NodeJS.ProcessEnv = process.env): ServerAuthOptions {
  if ((env.AUTH_MODE ?? "mock") === "auth0") {
    if (!env.AUTH0_DOMAIN || !env.AUTH0_AUDIENCE) throw new Error("AUTH_MODE=auth0 requires AUTH0_DOMAIN and AUTH0_AUDIENCE");
    return { mode: "auth0", domain: env.AUTH0_DOMAIN, audience: env.AUTH0_AUDIENCE, rolesClaim: env.AUTH0_ROLES_CLAIM };
  }
  if (env.PLATFORM_ENV === "production") throw new Error("AUTH_MODE=mock is not allowed when PLATFORM_ENV=production");
  return { mode: "mock", secret: env.AUTH_SECRET ?? "core-platform-mock-secret-local-dev-only-0000" };
}

const plugin: FastifyPluginAsync<ServerAuthOptions> = async (app, options) => {
  const verify = createVerifier(options);

  app.decorateRequest("principal", undefined);

  app.decorate("authenticate", async function authenticate(req: FastifyRequest, reply: FastifyReply) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) return reply.code(401).send({ error: "unauthenticated", message: "Missing bearer token" });
    try {
      req.principal = await verify(token);
    } catch (err) {
      req.log.info({ err }, "rejected bearer token");
      return reply.code(401).send({ error: "unauthenticated", message: "Invalid or expired token" });
    }
  });

  app.decorate("requireScopes", (...scopes: string[]) => {
    return async function requireScopes(req: FastifyRequest, reply: FastifyReply) {
      await app.authenticate.call(app, req, reply);
      if (reply.sent) return;
      const missing = scopes.filter((s) => !req.principal!.scopes.includes(s));
      if (missing.length) return reply.code(403).send({ error: "forbidden", missingScopes: missing });
    };
  });
};

function createVerifier(options: ServerAuthOptions): (token: string) => Promise<PlatformPrincipal> {
  if (options.mode === "mock") {
    const key = new TextEncoder().encode(options.secret);
    return async (token) => {
      const { payload } = await jwtVerify(token, key, { issuer: MOCK_ISSUER, audience: MOCK_AUDIENCE, algorithms: ["HS256"] });
      return toPrincipal(payload, token, "roles");
    };
  }
  const issuer = `https://${options.domain}/`;
  const jwks = createRemoteJWKSet(new URL(`${issuer}.well-known/jwks.json`));
  const rolesClaim = options.rolesClaim ?? "https://platform.company.com/roles";
  return async (token) => {
    const { payload } = await jwtVerify(token, jwks, { issuer, audience: options.audience, algorithms: ["RS256"] });
    return toPrincipal(payload, token, rolesClaim);
  };
}

function toPrincipal(payload: JWTPayload, token: string, rolesClaim: string): PlatformPrincipal {
  const roles = payload[rolesClaim];
  // Auth0 puts RBAC permissions in `permissions` and OAuth scopes in `scope`; honour both.
  const permissions = Array.isArray(payload.permissions) ? payload.permissions.map(String) : [];
  const scope = typeof payload.scope === "string" ? payload.scope.split(" ").filter(Boolean) : [];
  return {
    sub: payload.sub ?? "",
    name: typeof payload.name === "string" ? payload.name : undefined,
    email: typeof payload.email === "string" ? payload.email : undefined,
    roles: Array.isArray(roles) ? roles.map(String) : [],
    scopes: [...new Set([...scope, ...permissions])],
    claims: payload,
    token,
  };
}

export const platformAuth = fp(plugin, { name: "@core/server-auth", fastify: "5.x" });
export default platformAuth;
