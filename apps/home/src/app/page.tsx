import { requireSession } from "@core/auth";
import { loadAppRegistry } from "@core/shell/server";
import { Badge, Card, CardBody, EmptyState, PageHeader } from "@core/ui";

export default async function HomePage() {
  const [{ user }, apps] = await Promise.all([requireSession(), loadAppRegistry()]);
  const teamApps = apps.filter((a) => a.id !== "home");

  return (
    <>
      <PageHeader title={`Welcome back, ${user.name.split(" ")[0]}`} description="Everything on the platform, in one place." />
      {teamApps.length === 0 ? (
        <Card>
          <EmptyState title="No apps registered yet" description="Apps appear here once they are added to the gateway's routes.yaml." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teamApps.map((app) => (
            <a key={app.id} href={app.basePath} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardBody className="flex h-full flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-lg bg-brand-subtle text-xl" aria-hidden="true">
                      {app.icon ?? "▢"}
                    </span>
                    {app.team && <Badge>{app.team}</Badge>}
                  </div>
                  <div>
                    <h2 className="font-semibold text-fg group-hover:text-brand">{app.title}</h2>
                    {app.description && <p className="mt-1 text-sm text-fg-muted">{app.description}</p>}
                  </div>
                  <p className="mt-auto font-mono text-xs text-fg-muted">{app.basePath}</p>
                </CardBody>
              </Card>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
