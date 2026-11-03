import { describe, expect, it } from "vitest";
import { MOCK_PERSONAS, signMockToken, verifyMockToken } from "./token";

const secret = "x".repeat(40);

describe("mock tokens", () => {
  it("round-trips a persona", async () => {
    const persona = MOCK_PERSONAS[0]!;
    const { token } = await signMockToken(persona, secret);
    const { user, scopes } = await verifyMockToken(token, secret);
    expect(user).toEqual({ id: persona.id, name: persona.name, email: persona.email, roles: persona.roles });
    expect(scopes).toEqual(persona.scopes);
  });

  it("rejects a token signed with another secret", async () => {
    const { token } = await signMockToken(MOCK_PERSONAS[1]!, secret);
    await expect(verifyMockToken(token, "y".repeat(40))).rejects.toThrow();
  });
});
