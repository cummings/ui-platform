"use client";

import { useEffect, useRef } from "react";
import { usePlatformEvents } from "@core/sdk/client";
import "@/lib/events";

/** Publishes `orders.created` once, after the server confirms the order exists. */
export function AnnounceCreated({ id, customer, total }: { id: string; customer: string; total: number }) {
  const events = usePlatformEvents();
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    events.emit("orders.created", { id, customer, total });
    // Drop ?created=1 so a refresh doesn't announce twice.
    window.history.replaceState(null, "", window.location.pathname);
  }, [events, id, customer, total]);
  return null;
}
