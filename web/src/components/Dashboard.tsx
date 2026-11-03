"use client";

import { useState } from "react";
import { Badge, Card, CardBody, CardHeader, Stat, Table } from "@core/ui";
import { useQuery, useQueryClient, usePlatformEvent } from "@core/sdk/client";
import { money, type Summary } from "@/lib/types";
import "@/lib/events";

// Next.js doesn't prefix fetch() with basePath; the BFF route lives under /analytics.
const SUMMARY_URL = "/analytics/api/summary";

export function Dashboard({ initial }: { initial: Summary }) {
  const queryClient = useQueryClient();
  const [lastEvent, setLastEvent] = useState<string>();

  const { data, isFetching } = useQuery({
    queryKey: ["summary"],
    initialData: initial,
    refetchInterval: 30_000,
    queryFn: async () => {
      const res = await fetch(SUMMARY_URL, { headers: { accept: "application/json" } });
      if (!res.ok) throw new Error(`summary ${res.status}`);
      return (await res.json()) as Summary;
    },
  });

  // Published by the Orders app (another zone, another tab) through the platform event bus.
  usePlatformEvent("orders.created", (e) => {
    setLastEvent(`${e.payload.id} from ${e.payload.customer} (${money(e.payload.total)})`);
    void queryClient.invalidateQueries({ queryKey: ["summary"] });
  });
  usePlatformEvent("orders.status-changed", () => void queryClient.invalidateQueries({ queryKey: ["summary"] }));

  const max = Math.max(1, ...data.daily.map((d) => d.revenue));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-xs text-fg-muted" aria-live="polite">
        <span className={`inline-block size-2 rounded-full ${isFetching ? "animate-pulse bg-warning" : "bg-success"}`} />
        {lastEvent ? <span>Live: new order {lastEvent}</span> : <span>Live: listening for order events</span>}
        <span className="ml-auto">Updated {new Date(data.generatedAt).toLocaleTimeString("en-US")}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Revenue (excl. cancelled)" value={money(data.revenue)} />
        <Stat label="Orders" value={data.orderCount} />
        <Stat label="Average order value" value={money(data.averageOrderValue)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader title="Revenue, last 7 days" />
          <CardBody>
            <div className="flex h-48 items-end gap-3" role="img" aria-label="Daily revenue bar chart">
              {data.daily.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] tabular-nums text-fg-muted">{d.revenue ? money(d.revenue) : ""}</span>
                  <div
                    className="w-full rounded-t-md bg-brand transition-all"
                    style={{ height: `${Math.max(2, (d.revenue / max) * 140)}px`, opacity: d.revenue ? 1 : 0.2 }}
                    title={`${d.date}: ${money(d.revenue)} · ${d.orders} orders`}
                  />
                  <span className="text-[11px] text-fg-muted">
                    {new Date(`${d.date}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Orders by status" />
          <CardBody className="flex flex-col gap-2">
            {Object.entries(data.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="capitalize text-fg-muted">{status}</span>
                <span className="font-medium tabular-nums">{count}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Top customers" />
          <Table
            rows={data.topCustomers}
            rowKey={(c) => c.customer}
            columns={[
              { key: "c", header: "Customer", cell: (c) => c.customer },
              { key: "o", header: "Orders", align: "right", cell: (c) => c.orders },
              { key: "r", header: "Revenue", align: "right", cell: (c) => money(c.revenue) },
            ]}
          />
        </Card>
        <Card>
          <CardHeader title="Most recent orders" description="Open one in the Orders app" />
          <Table
            rows={data.recent}
            rowKey={(o) => o.id}
            columns={[
              // Cross-app link: plain <a>, full navigation into the Orders zone.
              { key: "id", header: "Order", cell: (o) => <a className="font-medium text-brand hover:underline" href={`/orders/${o.id}`}>{o.id}</a> },
              { key: "c", header: "Customer", cell: (o) => o.customer },
              { key: "s", header: "Status", cell: (o) => <Badge className="capitalize">{o.status}</Badge> },
              { key: "t", header: "Total", align: "right", cell: (o) => money(o.total) },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
