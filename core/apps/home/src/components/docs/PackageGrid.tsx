import { Badge, Card, CardBody } from "@core/ui";
import { getAllPackageInfo, getPackageInfo, type CorePackage } from "@/lib/registry";

const PURPOSE: Record<CorePackage, { summary: string; href: string; side: "web" | "api" | "both" | "tooling" }> = {
  shell: { summary: "Platform chrome: top bar, app launcher, nav, user menu", href: "/docs/shell", side: "web" },
  ui: { summary: "Design system: tokens and React components", href: "/docs/ui", side: "web" },
  auth: { summary: "Single sign-on for Next.js apps: proxy and session", href: "/docs/auth", side: "web" },
  sdk: { summary: "Context, hooks, API client, cross-app events", href: "/docs/sdk", side: "web" },
  "server-auth": { summary: "Token and scope checks for Fastify backends", href: "/docs/server-auth", side: "api" },
  config: { summary: "Shared tsconfig and ESLint presets", href: "/docs/config", side: "tooling" },
  "create-app": { summary: "Scaffold a new team repo", href: "/docs/getting-started", side: "tooling" },
};

export async function PackageGrid() {
  const packages = await getAllPackageInfo();
  return (
    <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">
      {packages.map((p) => {
        const meta = PURPOSE[p.name.replace("@core/", "") as CorePackage];
        return (
          <a key={p.name} href={meta.href} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardBody className="flex h-full flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-semibold text-fg group-hover:text-brand">{p.name}</code>
                  <Badge tone={p.source === "registry" ? "brand" : "neutral"} title={p.source === "registry" ? "Latest on the platform registry" : "Registry unreachable: workspace version"}>
                    v{p.version}
                  </Badge>
                </div>
                <p className="text-sm text-fg-muted">{meta.summary}</p>
                <p className="mt-auto text-xs text-fg-muted">
                  {meta.side === "web" ? "Team web apps" : meta.side === "api" ? "Team backends" : "Tooling"}
                  {p.publishedAt && ` · published ${new Date(p.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                </p>
              </CardBody>
            </Card>
          </a>
        );
      })}
    </div>
  );
}

/** "Latest: @core/x@1.2.3" from the registry, shown at the top of each package page. */
export async function InstallLine({ packages }: { packages: CorePackage[] }) {
  const infos = await Promise.all(packages.map(getPackageInfo));
  return (
    <p className="text-sm text-fg-muted">
      Latest:{" "}
      {infos.map((i, n) => (
        <span key={i.name}>
          {n > 0 && ", "}
          <code>
            {i.name}@{i.version}
          </code>
        </span>
      ))}
    </p>
  );
}
