import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@core/auth";
import { ApiError } from "@core/sdk";
import { Badge, Card, CardBody, CardHeader, PageHeader, Table } from "@core/ui";
import { AnnounceCreated } from "@/components/OrderEvents";
import { StatusControl } from "@/components/StatusControl";
import { getApi } from "@/lib/api";
import { canWrite, money, STATUS_TONE, type Order } from "@/lib/types";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, { created }, session, api] = await Promise.all([params, searchParams, requireSession(), getApi()]);
  let order: Order;
  try {
    order = await api.get<Order>(`/api/orders/${encodeURIComponent(id)}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <>
      {created && <AnnounceCreated id={order.id} customer={order.customer} total={order.total} />}
      <p className="mb-2 text-sm">
        <Link href="/" className="text-fg-muted hover:text-fg">
          ← All orders
        </Link>
      </p>
      <PageHeader
        title={order.id}
        description={`${order.customer} · created ${new Date(order.createdAt).toLocaleString("en-US")}`}
        actions={<Badge tone={STATUS_TONE[order.status]} className="capitalize">{order.status}</Badge>}
      />
      {created && (
        <p role="status" className="mb-4 rounded-lg bg-success/10 px-4 py-2.5 text-sm text-success">
          Order created. Analytics has been notified.
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader title="Line items" />
          <Table
            rows={order.lines}
            rowKey={(l) => l.sku}
            columns={[
              { key: "sku", header: "SKU", cell: (l) => <span className="font-mono text-xs">{l.sku}</span> },
              { key: "desc", header: "Product", cell: (l) => l.description },
              { key: "qty", header: "Qty", align: "right", cell: (l) => l.quantity },
              { key: "price", header: "Unit price", align: "right", cell: (l) => money(l.unitPrice) },
              { key: "sum", header: "Amount", align: "right", cell: (l) => money(l.quantity * l.unitPrice) },
            ]}
          />
          <CardBody className="flex justify-end border-t border-border text-sm">
            <span className="text-fg-muted">Total</span>
            <span className="ml-6 font-semibold tabular-nums">{money(order.total)}</span>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Fulfilment" />
          <CardBody>
            {canWrite(session.user.roles) ? (
              <StatusControl id={order.id} status={order.status} />
            ) : (
              <p className="text-sm text-fg-muted">You have read-only access to orders.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
