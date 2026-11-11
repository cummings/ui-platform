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
  /** Only highlight on an exact path match (e.g. a section index like "/docs"). */
  exact?: boolean;
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
  linkComponent?: ComponentType<{ href: string; className?: string; "aria-current"?: "page"; children: ReactNode }>;
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
      <div className="flex flex-1 flex-col md:flex-row">
        {nav && nav.length > 0 && (
          <nav
            aria-label={`${current?.title ?? appId} navigation`}
            className={cn(
              "shrink-0 border-border bg-surface",
              // Phones: a horizontally scrolling row under the top bar. Desktop: a sticky sidebar.
              "sticky top-14 z-30 overflow-x-auto border-b px-3 py-2",
              "md:h-[calc(100vh-3.5rem)] md:w-56 md:overflow-y-auto md:border-b-0 md:border-r md:py-4",
            )}
          >
            <ul className="flex gap-1 md:flex-col md:gap-0.5">
              {nav.map((item) => {
                const active =
                  activePath === item.href || (!item.exact && item.href !== "/" && activePath?.startsWith(`${item.href}/`));
                return (
                  <li key={item.href} className="shrink-0">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm",
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
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function DefaultLink({ href, className, children, ...rest }: { href: string; className?: string; "aria-current"?: "page"; children: ReactNode }) {
  return (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}
