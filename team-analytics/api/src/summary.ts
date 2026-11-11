export interface OrderLike {
  id: string;
  customer: string;
  status: string;
  total: number;
  createdAt: string;
}

export interface Summary {
  generatedAt: string;
  orderCount: number;
  revenue: number;
  averageOrderValue: number;
  byStatus: Record<string, number>;
  topCustomers: { customer: string; revenue: number; orders: number }[];
  daily: { date: string; revenue: number; orders: number }[];
  recent: OrderLike[];
}

/** Pure aggregation, so it is trivial to test and to move into a warehouse job later. */
export function summarize(orders: OrderLike[], now = new Date()): Summary {
  const counted = orders.filter((o) => o.status !== "cancelled");
  const revenue = round(counted.reduce((s, o) => s + o.total, 0));

  const byStatus: Record<string, number> = {};
  for (const o of orders) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;

  const customers = new Map<string, { revenue: number; orders: number }>();
  for (const o of counted) {
    const c = customers.get(o.customer) ?? { revenue: 0, orders: 0 };
    c.revenue = round(c.revenue + o.total);
    c.orders += 1;
    customers.set(o.customer, c);
  }

  const daily: Summary["daily"] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    const day = counted.filter((o) => o.createdAt.slice(0, 10) === date);
    daily.push({ date, revenue: round(day.reduce((s, o) => s + o.total, 0)), orders: day.length });
  }

  return {
    generatedAt: now.toISOString(),
    orderCount: counted.length,
    revenue,
    averageOrderValue: counted.length ? round(revenue / counted.length) : 0,
    byStatus,
    topCustomers: [...customers.entries()]
      .map(([customer, v]) => ({ customer, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    daily,
    recent: [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
  };
}

const round = (n: number) => Math.round(n * 100) / 100;
