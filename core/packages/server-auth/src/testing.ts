import { SignJWT } from "jose";
import { MOCK_AUDIENCE, MOCK_ISSUER } from "./index";

export interface TestTokenOptions {
  sub?: string;
  name?: string;
  email?: string;
  roles?: string[];
  scopes?: string[];
  ttlSeconds?: number;
}

/** Mint a mock-mode bearer token for API tests (`app.inject({ headers: { authorization } })`). */
export async function createTestToken(secret: string, options: TestTokenOptions = {}): Promise<string> {
  return new SignJWT({
    name: options.name ?? "Test User",
    email: options.email ?? "test@example.test",
    roles: options.roles ?? [],
    scope: (options.scopes ?? []).join(" "),
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(options.sub ?? "test|user")
    .setIssuer(MOCK_ISSUER)
    .setAudience(MOCK_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + (options.ttlSeconds ?? 300))
    .sign(new TextEncoder().encode(secret));
}
