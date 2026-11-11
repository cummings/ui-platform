import type { ReactNode } from "react";
import { cn } from "@core/ui";

const tones = {
  info: { label: "Note", className: "border-brand/30 bg-brand-subtle" },
  warning: { label: "Watch out", className: "border-warning/30 bg-warning/10" },
  rule: { label: "Platform rule", className: "border-success/30 bg-success/10" },
} as const;

export function Callout({ type = "info", title, children }: { type?: keyof typeof tones; title?: string; children: ReactNode }) {
  const tone = tones[type];
  return (
    <aside className={cn("my-5 rounded-card border px-4 py-3 text-sm [&_p]:my-1", tone.className)}>
      <p className="font-semibold text-fg">{title ?? tone.label}</p>
      <div className="text-fg">{children}</div>
    </aside>
  );
}
