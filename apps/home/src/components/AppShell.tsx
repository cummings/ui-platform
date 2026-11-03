"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { PlatformApp, PlatformUser } from "@core/sdk";
import { PlatformShell } from "@core/shell";

export function AppShell(props: { user: PlatformUser; apps: PlatformApp[]; children: ReactNode }) {
  return <PlatformShell {...props} appId="home" activePath={usePathname()} linkComponent={Link} />;
}
