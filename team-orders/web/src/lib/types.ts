export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export interface Order {
  id: string;
  customer: string;
  status: OrderStatus;
  lines: { sku: string; description: string; quantity: number; unitPrice: number }[];
  total: number;
  createdAt: string;
  createdBy: string;
}

export const STATUS_TONE = {
  pending: "warning",
  paid: "brand",
  shipped: "success",
  cancelled: "neutral",
} as const;

export const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const canWrite = (roles: string[]) => roles.includes("orders-manager");
