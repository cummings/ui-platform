import { PageHeader } from "@core/ui";
import { Dashboard } from "@/components/Dashboard";
import { getApi } from "@/lib/api";
import type { Summary } from "@/lib/types";

export default async function DashboardPage() {
  const api = await getApi();
  const initial = await api.get<Summary>("/api/analytics/summary");
  return (
    <>
      <PageHeader title="Analytics" description="Order and revenue insights, updated live as orders come in." />
      <Dashboard initial={initial} />
    </>
  );
}
