import { useEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@core/ui";
import type { PlatformApp } from "@core/sdk";

export function AppLauncher({ apps, currentAppId }: { apps: PlatformApp[]; currentAppId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Switch app"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className="grid size-9 place-items-center rounded-lg text-chrome-fg/80 hover:bg-white/10 hover:text-chrome-fg"
      >
        <svg viewBox="0 0 20 20" className="size-5" fill="currentColor" aria-hidden="true">
          {[3, 9, 15].flatMap((y) => [3, 9, 15].map((x) => <rect key={`${x}-${y}`} x={x - 1.5} y={y - 1.5} width="3.5" height="3.5" rx="1" />))}
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute left-0 top-11 z-50 w-80 rounded-card border border-border bg-surface p-2 text-fg shadow-xl">
          <p className="px-2 pb-2 pt-1 text-xs font-medium uppercase tracking-wide text-fg-muted">Apps</p>
          <div className="grid grid-cols-2 gap-1">
            {apps.map((app) => (
              // Full page navigation: each app is a separately deployed zone.
              <a
                key={app.id}
                role="menuitem"
                href={app.basePath}
                className={cn(
                  "flex flex-col gap-0.5 rounded-lg px-3 py-2.5 hover:bg-surface-muted",
                  app.id === currentAppId && "bg-brand-subtle",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span aria-hidden="true">{app.icon ?? "▢"}</span>
                  {app.title}
                </span>
                {app.description && <span className="line-clamp-2 text-xs text-fg-muted">{app.description}</span>}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function useDismiss(ref: RefObject<HTMLElement | null>, active: boolean, onDismiss: () => void) {
  useEffect(() => {
    if (!active) return;
    const onPointer = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && onDismiss();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDismiss();
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, active, onDismiss]);
}
