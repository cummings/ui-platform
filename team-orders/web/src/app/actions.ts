"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiError } from "@core/sdk";
import { getApi } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";

export interface FormState {
  error?: string;
}

export async function createOrder(_prev: FormState, form: FormData): Promise<FormState> {
  const customer = String(form.get("customer") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const quantity = Number(form.get("quantity"));
  const unitPrice = Number(form.get("unitPrice"));
  if (customer.length < 2) return { error: "Customer name is required." };
  if (!description || !(quantity >= 1) || !(unitPrice >= 0)) return { error: "Enter a product, quantity and price." };

  let order: Order;
  try {
    const api = await getApi();
    order = await api.post<Order>("/api/orders", {
      customer,
      lines: [{ sku: description.slice(0, 8).toUpperCase().replace(/\W/g, "-"), description, quantity, unitPrice }],
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) return { error: "You don't have permission to create orders." };
    throw err;
  }
  revalidatePath("/");
  redirect(`/${order.id}?created=1`);
}

export async function updateStatus(id: string, status: OrderStatus) {
  const api = await getApi();
  await api.patch<Order>(`/api/orders/${id}/status`, { status });
  revalidatePath(`/${id}`);
  revalidatePath("/");
}
