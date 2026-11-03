import { useRef, useState } from "react";
import type { PlatformUser } from "@core/sdk";
import { useDismiss } from "./AppLauncher";

export function UserMenu({ user }: { user: PlatformUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Account"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid size-9 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg"
      >
        {user.picture ? <img src={user.picture} alt="" className="size-9 rounded-full" /> : initials}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-11 z-50 w-64 rounded-card border border-border bg-surface p-2 text-fg shadow-xl">
          <div className="px-3 py-2">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-fg-muted">{user.email}</p>
            {user.roles.length > 0 && <p className="mt-1 text-xs text-fg-muted">Roles: {user.roles.join(", ")}</p>}
          </div>
          <hr className="my-1 border-border" />
          <ThemeToggle />
          <a role="menuitem" href="/auth/logout" className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-muted">
            Sign out
          </a>
        </div>
      )}
    </div>
  );
}

function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    // Root-path cookie so the choice follows the user across every app.
    document.cookie = `platform_theme=${next}; path=/; max-age=31536000; samesite=lax`;
  };
  return (
    <button type="button" role="menuitem" onClick={toggle} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-muted">
      Toggle dark mode
    </button>
  );
}
