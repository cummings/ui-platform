import { Card, CardBody, CardHeader, PageHeader } from "@core/ui";
import { getApi } from "@/lib/api";

export default async function OverviewPage() {
  const api = await getApi();
  const { items } = await api.get<{ items: { id: string; name: string }[] }>("__API_PATH__/items");

  return (
    <>
      <PageHeader title="__APP_TITLE__" description="Built on the Core Platform." />
      <Card>
        <CardHeader title="Items" description="Loaded server-side from __API_PATH__ with your platform session." />
        <CardBody>
          <ul className="list-disc pl-5 text-sm">
            {items.map((i) => (
              <li key={i.id}>{i.name}</li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </>
  );
}
