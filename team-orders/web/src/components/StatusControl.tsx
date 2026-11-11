"use client";

import { useTransition } from "react";
import { Select } from "@core/ui";
import { usePlatformEvents } from "@core/sdk/client";
import { updateStatus } from "@/app/actions";
import type { OrderStatus } from "@/lib/types";
import "@/lib/events";

export function StatusControl({ id, status }: { id: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();
  const events = usePlatformEvents();

  return (
    <div className="w-48">
      <Select
        label="Status"
        value={status}
        disabled={pending}
        options={["pending", "paid", "shipped", "cancelled"].map((s) => ({ value: s, label: s[0]!.toUpperCase() + s.slice(1) }))}
        onChange={(e) => {
          const next = e.target.value as OrderStatus;
          startTransition(async () => {
            await updateStatus(id, next);
            events.emit("orders.status-changed", { id, status: next });
          });
        }}
      />
    </div>
  );
}
