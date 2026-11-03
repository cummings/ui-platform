import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy classes", () => {
    expect(cn("a", false, undefined, "b", null, "")).toBe("a b");
  });
});
