"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { PlatformApp, PlatformUser } from "@core/sdk";
import { PlatformShell, type NavItem } from "@core/shell";

const homeNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Developer docs", href: "/docs" },
];

/** Section nav for /docs. Keep in sync with the folders in src/app/docs. */
export const docsNav: NavItem[] = [
  { label: "Overview", href: "/docs", exact: true },
  { label: "Getting started", href: "/docs/getting-started" },
  { label: "Shell", href: "/docs/shell" },
  { label: "Design system (ui)", href: "/docs/ui" },
  { label: "Auth", href: "/docs/auth" },
  { label: "SDK", href: "/docs/sdk" },
  { label: "Cross-app events", href: "/docs/events" },
  { label: "Backends (server-auth)", href: "/docs/server-auth" },
  { label: "Config", href: "/docs/config" },
  { label: "Versioning & rules", href: "/docs/versioning" },
  { label: "← Back to Home", href: "/" },
];

export function AppShell(props: { user: PlatformUser; apps: PlatformApp[]; children: ReactNode }) {
  const pathname = usePathname();
  const inDocs = pathname === "/docs" || pathname.startsWith("/docs/");
  return (
    <PlatformShell
      {...props}
      appId="home"
      nav={inDocs ? docsNav : homeNav}
      activePath={pathname}
      linkComponent={Link}
    />
  );
}
