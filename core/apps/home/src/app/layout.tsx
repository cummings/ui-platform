import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { requireSession } from "@core/auth";
import { PlatformProvider } from "@core/sdk/client";
import { loadAppRegistry } from "@core/shell/server";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = { title: { default: "Core Platform", template: "%s · Core Platform" } };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [session, apps, cookieStore] = await Promise.all([requireSession(), loadAppRegistry(), cookies()]);
  const theme = cookieStore.get("platform_theme")?.value === "dark" ? "dark" : "light";

  return (
    <html lang="en" data-theme={theme}>
      <body>
        <PlatformProvider user={session.user} appId="home" apps={apps} flags={{}}>
          <AppShell user={session.user} apps={apps}>
            {children}
          </AppShell>
        </PlatformProvider>
      </body>
    </html>
  );
}
