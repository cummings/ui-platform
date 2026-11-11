// Events this app consumes. The shape is owned by Team Orders (their web/src/lib/events.ts);
// declaring it here is our side of that contract.
declare module "@core/sdk" {
  interface PlatformEventMap {
    "orders.created": { id: string; customer: string; total: number };
    "orders.status-changed": { id: string; status: string };
  }
}

export {};
