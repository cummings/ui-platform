import { jwtVerify, SignJWT } from "jose";
import type { PlatformUser } from "@core/sdk";

/**
 * Mock-mode tokens: HS256 JWTs shaped like Auth0 access tokens, so web apps and APIs
 * exercise the same code paths locally. `@core/server-auth` verifies these with the same
 * issuer/audience (keep in sync with server-auth/src/constants.ts).
 */
export const MOCK_ISSUER = "urn:core-platform:mock";
export const MOCK_AUDIENCE = "urn:core-platform:api";

export interface MockPersona extends PlatformUser {
  scopes: string[];
}

export const MOCK_PERSONAS: MockPersona[] = [
  {
    id: "mock|alice",
    name: "Alice Admin",
    email: "alice@example.test",
    roles: ["platform-admin", "orders-manager"],
    scopes: ["orders:read", "orders:write", "analytics:read"],
  },
  {
    id: "mock|bob",
    name: "Bob Viewer",
    email: "bob@example.test",
    roles: ["viewer"],
    scopes: ["orders:read", "analytics:read"],
  },
];

const encoder = new TextEncoder();
const SESSION_TTL_SECONDS = 8 * 60 * 60;

export async function signMockToken(persona: MockPersona, secret: string, ttlSeconds = SESSION_TTL_SECONDS) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const token = await new SignJWT({
    name: persona.name,
    email: persona.email,
    roles: persona.roles,
    scope: persona.scopes.join(" "),
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(persona.id)
    .setIssuer(MOCK_ISSUER)
    .setAudience(MOCK_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(encoder.encode(secret));
  return { token, expiresAt: exp };
}

export async function verifyMockToken(token: string, secret: string) {
  const { payload } = await jwtVerify(token, encoder.encode(secret), {
    issuer: MOCK_ISSUER,
    audience: MOCK_AUDIENCE,
    algorithms: ["HS256"],
  });
  const user: PlatformUser = {
    id: payload.sub ?? "",
    name: String(payload.name ?? ""),
    email: String(payload.email ?? ""),
    roles: Array.isArray(payload.roles) ? payload.roles.map(String) : [],
  };
  return { user, expiresAt: payload.exp ?? 0, scopes: String(payload.scope ?? "").split(" ").filter(Boolean) };
}
