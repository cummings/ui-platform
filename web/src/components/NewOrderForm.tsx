"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, Card, CardBody, CardHeader, Input } from "@core/ui";
import { createOrder, type FormState } from "@/app/actions";

export function NewOrderForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createOrder, {});

  return (
    <Card className="max-w-xl">
      <CardHeader title="Order details" description="Orders start as pending." />
      <CardBody>
        <form action={action} className="flex flex-col gap-4">
          <Input name="customer" label="Customer" placeholder="Northwind Traders" required minLength={2} />
          <Input name="description" label="Product" placeholder="Standing desk" required />
          <div className="grid grid-cols-2 gap-4">
            <Input name="quantity" label="Quantity" type="number" min={1} defaultValue={1} required />
            <Input name="unitPrice" label="Unit price (USD)" type="number" min={0} step="0.01" required />
          </div>
          {state.error && (
            <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Link href="/">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={pending}>
              Create order
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
