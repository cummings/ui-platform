import { readFile } from "node:fs/promises";
import path from "node:path";

export const CORE_PACKAGES = ["shell", "ui", "auth", "sdk", "server-auth", "config", "create-app"] as const;
export type CorePackage = (typeof CORE_PACKAGES)[number];

export interface PackageInfo {
  name: string;
  version: string;
  publishedAt?: string;
  /** "registry" when read from the private npm registry, "workspace" when it was unreachable. */
  source: "registry" | "workspace";
}

const REGISTRY = (process.env.CORE_REGISTRY_URL ?? "http://localhost:4873").replace(/\/$/, "");

/** Latest published version of each @core package, so the docs always show what teams can install. */
export async function getPackageInfo(pkg: CorePackage): Promise<PackageInfo> {
  const name = `@core/${pkg}`;
  try {
    const res = await fetch(`${REGISTRY}/${name.replace("/", "%2f")}`, { next: { revalidate: 300 } } as RequestInit);
    if (!res.ok) throw new Error(String(res.status));
    const body = (await res.json()) as { "dist-tags": { latest: string }; time?: Record<string, string> };
    const version = body["dist-tags"].latest;
    return { name, version, publishedAt: body.time?.[version], source: "registry" };
  } catch {
    return { name, version: await workspaceVersion(pkg), source: "workspace" };
  }
}

export async function getAllPackageInfo() {
  return Promise.all(CORE_PACKAGES.map(getPackageInfo));
}

async function workspaceVersion(pkg: CorePackage): Promise<string> {
  try {
    const file = path.join(process.cwd(), "../../packages", pkg, "package.json");
    return (JSON.parse(await readFile(file, "utf8")) as { version: string }).version;
  } catch {
    return "unknown";
  }
}
