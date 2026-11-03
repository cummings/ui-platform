export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export interface OrderLine {
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customer: string;
  status: OrderStatus;
  lines: OrderLine[];
  total: number;
  createdAt: string;
  createdBy: string;
}

export const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "cancelled"];

/** In-memory store. Swap for the team's own database; the API contract stays the same. */
export function createStore() {
  const orders = new Map<string, Order>();
  let seq = 1000;

  const add = (input: Omit<Order, "id" | "total" | "createdAt"> & { createdAt?: string }) => {
    const id = `ORD-${++seq}`;
    const total = round(input.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0));
    const order: Order = { ...input, id, total, createdAt: input.createdAt ?? new Date().toISOString() };
    orders.set(id, order);
    return order;
  };

  const seed: [string, OrderStatus, OrderLine[], number][] = [
    ["Northwind Traders", "shipped", [{ sku: "CHR-01", description: "Ergonomic chair", quantity: 4, unitPrice: 289 }], 6],
    ["Contoso Ltd", "paid", [{ sku: "DSK-02", description: "Standing desk", quantity: 2, unitPrice: 649 }], 4],
    ["Fabrikam", "pending", [{ sku: "MON-27", description: '27" monitor', quantity: 6, unitPrice: 319 }], 2],
    ["Northwind Traders", "paid", [{ sku: "KBD-10", description: "Mechanical keyboard", quantity: 10, unitPrice: 129 }], 1],
    ["Adventure Works", "cancelled", [{ sku: "LMP-03", description: "Desk lamp", quantity: 3, unitPrice: 59 }], 3],
  ];
  for (const [customer, status, lines, daysAgo] of seed) {
    add({ customer, status, lines, createdBy: "seed", createdAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString() });
  }

  return {
    list: (status?: OrderStatus) =>
      [...orders.values()].filter((o) => !status || o.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    get: (id: string) => orders.get(id),
    create: add,
    setStatus: (id: string, status: OrderStatus) => {
      const order = orders.get(id);
      if (order) order.status = status;
      return order;
    },
  };
}

const round = (n: number) => Math.round(n * 100) / 100;
