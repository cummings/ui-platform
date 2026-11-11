import type { ReactNode } from "react";
import { cn } from "../cn";

export interface StatProps {
  label: string;
  value: ReactNode;
  delta?: { value: string; direction: "up" | "down" | "flat" };
  className?: string;
}

export function Stat({ label, value, delta, className }: StatProps) {
  return (
    <div className={cn("rounded-card border border-border bg-surface px-5 py-4", className)}>
      <p className="text-sm text-fg-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-fg">{value}</p>
      {delta && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            delta.direction === "up" && "text-success",
            delta.direction === "down" && "text-danger",
            delta.direction === "flat" && "text-fg-muted",
          )}
        >
          {delta.direction === "up" ? "▲" : delta.direction === "down" ? "▼" : "•"} {delta.value}
        </p>
      )}
    </div>
  );
}
