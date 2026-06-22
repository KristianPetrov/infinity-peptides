"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  cancelOrder,
  markOrderPaid,
  markOrderShipped,
  updateInventoryItem,
} from "@/lib/orders/service";
import { requireAdmin } from "@/lib/admin/auth";
import { clearSession } from "@/lib/auth/session";

export async function logoutAdmin() {
  await clearSession();
  redirect("/login");
}

export async function markPaidAction(formData: FormData) {
  await requireAdmin();
  await markOrderPaid(String(formData.get("orderId") || ""));
  revalidatePath("/admin/orders");
}

export async function shipOrderAction(formData: FormData) {
  await requireAdmin();
  await markOrderShipped(
    String(formData.get("orderId") || ""),
    String(formData.get("carrier") || ""),
    String(formData.get("trackingNumber") || ""),
  );
  revalidatePath("/admin/orders");
}

export async function cancelOrderAction(formData: FormData) {
  await requireAdmin();
  await cancelOrder(String(formData.get("orderId") || ""));
  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
}

export async function updateInventoryAction(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "");
  const rawPrice = String(formData.get("priceCents") || "").trim();
  const rawInventory = String(formData.get("inventory") || "0").trim();
  await updateInventoryItem(productId, {
    inventory: Math.max(0, Number.parseInt(rawInventory, 10) || 0),
    priceCents: rawPrice ? Math.max(0, Number.parseInt(rawPrice, 10) || 0) : null,
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
  });
  revalidatePath("/admin/inventory");
  revalidatePath("/store");
}
