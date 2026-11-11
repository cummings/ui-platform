import { redirect } from "next/navigation";
import { requireSession } from "@core/auth";
import { PageHeader } from "@core/ui";
import { NewOrderForm } from "@/components/NewOrderForm";
import { canWrite } from "@/lib/types";

export const metadata = { title: "New order" };

export default async function NewOrderPage() {
  const { user } = await requireSession();
  if (!canWrite(user.roles)) redirect("/");
  return (
    <>
      <PageHeader title="New order" />
      <NewOrderForm />
    </>
  );
}
