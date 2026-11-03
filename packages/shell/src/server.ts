import type { PlatformApp } from "@core/sdk";

/**
 * Load the runtime app registry published by the gateway (generated from routes.yaml).
 * Fetched server-side so new apps appear in every launcher without republishing packages.
 *
 * PLATFORM_REGISTRY_URL defaults to the in-cluster gateway; PLATFORM_APPS (JSON) is a fallback
 * for running an app on its own.
 */
export async function loadAppRegistry(): Promise<PlatformApp[]> {
  const url = process.env.PLATFORM_REGISTRY_URL ?? "http://gateway/platform/apps.json";
  try {
    const res = await fetch(url, { next: { revalidate: 60 } } as RequestInit);
    if (!res.ok) throw new Error(`registry responded ${res.status}`);
    const body = (await res.json()) as { apps: PlatformApp[] };
    return body.apps;
  } catch (err) {
    if (process.env.PLATFORM_APPS) return JSON.parse(process.env.PLATFORM_APPS) as PlatformApp[];
    console.warn(`[@core/shell] could not load app registry from ${url}:`, (err as Error).message);
    return [];
  }
}
