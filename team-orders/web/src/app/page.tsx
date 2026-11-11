import Link from "next/link";
import { requireSession } from "@core/auth";
import { Badge, Button, Card, CardHeader, EmptyState, PageHeader, Stat, Table } from "@core/ui";
import { getApi } from "@/lib/api";
import { canWrite, money, shortDate, STATUS_TONE, type Order, type OrderStatus } from "@/lib/types";

const FILTERS: (OrderStatus | "all")[] = ["all", "pending", "paid", "shipped", "cancelled"];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const active = FILTERS.includes(status as OrderStatus) ? (status as OrderStatus) : "all";
  const [session, api] = await Promise.all([requireSession(), getApi()]);
  const { orders: all } = await api.get<{ orders: Order[] }>("/api/orders");
  const orders = active === "all" ? all : all.filter((o) => o.status === active);
  const live = all.filter((o) => o.status !== "cancelled");

  return (
    <>
      <PageHeader
        title="Orders"
        description="Every customer order across channels."
        actions={
          canWrite(session.user.roles) && (
            <Link href="/new">
              <Button>New order</Button>
            </Link>
          )
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Open orders" value={all.filter((o) => o.status === "pending" || o.status === "paid").length} />
        <Stat label="Revenue (excl. cancelled)" value={money(live.reduce((s, o) => s + o.total, 0))} />
        <Stat label="Shipped" value={all.filter((o) => o.status === "shipped").length} />
      </div>
      <Card>
        <CardHeader
          title="Orders"
          actions={
            <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by status">
              {FILTERS.map((f) => (
                <Link
                  key={f}
                  href={f === "all" ? "/" : `/?status=${f}`}
                  aria-current={f === active ? "page" : undefined}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${f === active ? "bg-brand text-brand-fg" : "bg-surface-muted text-fg-muted hover:text-fg"}`}
                >
                  {f}
                </Link>
              ))}
            </div>
          }
        />
        <Table
          caption="Orders"
          rows={orders}
          rowKey={(o) => o.id}
          empty={<EmptyState title="No orders" description="Nothing matches this filter." />}
          columns={[
            { key: "id", header: "Order", cell: (o) => <Link className="font-medium text-brand hover:underline" href={`/${o.id}`}>{o.id}</Link> },
            { key: "customer", header: "Customer", cell: (o) => o.customer },
            { key: "date", header: "Created", cell: (o) => shortDate(o.createdAt) },
            { key: "status", header: "Status", cell: (o) => <Badge tone={STATUS_TONE[o.status]} className="capitalize">{o.status}</Badge> },
            { key: "total", header: "Total", align: "right", cell: (o) => money(o.total) },
          ]}
        />
      </Card>
    </>
  );
}
