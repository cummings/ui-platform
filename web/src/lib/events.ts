// Events this app publishes on the platform event bus. Other teams subscribe by declaring the
// same shape (see platform ARCHITECTURE.md → "Cross-app events"). Treat as a public contract.
declare module "@core/sdk" {
  interface PlatformEventMap {
    "orders.created": { id: string; customer: string; total: number };
    "orders.status-changed": { id: string; status: string };
  }
}

export {};
