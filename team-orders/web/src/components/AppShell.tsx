"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { PlatformApp, PlatformUser } from "@core/sdk";
import { PlatformShell, type NavItem } from "@core/shell";

export function AppShell(props: { user: PlatformUser; apps: PlatformApp[]; canWrite: boolean; children: ReactNode }) {
  const { canWrite, ...rest } = props;
  const nav: NavItem[] = [
    { label: "All orders", href: "/" },
    ...(canWrite ? [{ label: "New order", href: "/new" }] : []),
  ];
  return <PlatformShell {...rest} appId="orders" nav={nav} activePath={usePathname()} linkComponent={Link} />;
}
