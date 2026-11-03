import { describe, expect, it, vi } from "vitest";
import { createEventBus } from "./events";

declare module "./events" {
  interface PlatformEventMap {
    "test.ping": { n: number };
  }
}

describe("createEventBus", () => {
  it("delivers typed events to local listeners and unsubscribes", () => {
    const bus = createEventBus("test", new EventTarget());
    const listener = vi.fn();
    const off = bus.on("test.ping", listener);

    bus.emit("test.ping", { n: 1 });
    off();
    bus.emit("test.ping", { n: 2 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]?.[0]).toMatchObject({ type: "test.ping", payload: { n: 1 }, source: "test" });
  });
});
