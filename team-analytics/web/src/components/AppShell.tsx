"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { PlatformApp, PlatformUser } from "@core/sdk";
import { PlatformShell, type NavItem } from "@core/shell";

const nav: NavItem[] = [{ label: "Dashboard", href: "/" }];

export function AppShell(props: { user: PlatformUser; apps: PlatformApp[]; children: ReactNode }) {
  return <PlatformShell {...props} appId="analytics" nav={nav} activePath={usePathname()} linkComponent={Link} />;
}
