import type { ComponentType, ReactNode } from "react";
import { cn } from "@core/ui";
import type { PlatformApp, PlatformUser } from "@core/sdk";
import { AppLauncher } from "./AppLauncher";
import { UserMenu } from "./UserMenu";

export interface NavItem {
  label: string;
  /** Path inside the app (without basePath) — rendered with the app's own Link component. */
  href: string;
  icon?: ReactNode;
}

export interface PlatformShellProps {
  user: PlatformUser;
  apps: PlatformApp[];
  appId: string;
  /** In-app navigation. Omit for apps without a side nav. */
  nav?: NavItem[];
  /** Current in-app pathname, to highlight the active nav item. */
  activePath?: string;
  /** Pass `next/link` so in-app navigation stays client-side. */
  linkComponent?: ComponentType<{ href: string; className?: string; children: ReactNode }>;
  children: ReactNode;
}

/** The platform chrome every app renders around its pages. */
export function PlatformShell({ user, apps, appId, nav, activePath, linkComponent, children }: PlatformShellProps) {
  const current = apps.find((a) => a.id === appId);
  const Link = linkComponent ?? DefaultLink;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 bg-chrome px-4 text-chrome-fg">
        <AppLauncher apps={apps} currentAppId={appId} />
        <a href="/" className="text-sm font-semibold tracking-tight">
          Core Platform
        </a>
        {current && current.basePath !== "/" && (
          <>
            <span className="text-chrome-fg/40" aria-hidden="true">
              /
            </span>
            <a href={current.basePath} className="text-sm text-chrome-fg/90">
              {current.title}
            </a>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <UserMenu user={user} />
        </div>
      </header>
      <div className="flex flex-1">
        {nav && nav.length > 0 && (
          <nav aria-label={`${current?.title ?? appId} navigation`} className="hidden w-56 shrink-0 border-r border-border bg-surface px-3 py-4 md:block">
            <ul className="flex flex-col gap-0.5">
              {nav.map((item) => {
                const active = activePath === item.href || (item.href !== "/" && activePath?.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                        active ? "bg-brand-subtle font-medium text-brand" : "text-fg-muted hover:bg-surface-muted hover:text-fg",
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
        <main className="min-w-0 flex-1 px-6 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function DefaultLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
