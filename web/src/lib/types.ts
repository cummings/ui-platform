export interface Summary {
  generatedAt: string;
  orderCount: number;
  revenue: number;
  averageOrderValue: number;
  byStatus: Record<string, number>;
  topCustomers: { customer: string; revenue: number; orders: number }[];
  daily: { date: string; revenue: number; orders: number }[];
  recent: { id: string; customer: string; status: string; total: number; createdAt: string }[];
}

export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
