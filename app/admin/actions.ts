"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  cancelOrder,
  createReferralCode,
  createReferralPartner,
  markOrderPaid,
  markOrderShipped,
  updateInventoryItem,
  updateOrderStatus,
  updateReferralCodeSettings,
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

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  await updateOrderStatus(String(formData.get("orderId") || ""), {
    status: String(formData.get("status") || ""),
    carrier: String(formData.get("carrier") || ""),
    trackingNumber: String(formData.get("trackingNumber") || ""),
  });
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

export async function updateReferralCodeAction(formData: FormData) {
  await requireAdmin();
  await updateReferralCodeSettings(String(formData.get("referralCodeId") || ""), {
    active: formData.get("active") === "on",
    allowReconstitutionSolution: formData.get("allowReconstitutionSolution") === "on",
  });
  revalidatePath("/admin/referrals");
}

export async function createReferralPartnerAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) throw new Error("Referral partner name is required.");
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error("Referral partner email is invalid.");
  }

  await createReferralPartner({
    name,
    email: email || null,
    notes: notes || null,
    active: formData.get("active") === "on",
  });
  revalidatePath("/admin/referrals");
}

export async function createReferralCodeAction(formData: FormData) {
  await requireAdmin();
  const partnerId = String(formData.get("partnerId") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const discountType = String(formData.get("discountType") || "percent");
  const rawDiscountValue = String(formData.get("discountValue") || "").trim();
  const rawMinSubtotal = String(formData.get("minSubtotalDollars") || "").trim();

  if (!partnerId) throw new Error("Choose a referral partner.");
  if (!code) throw new Error("Referral code is required.");
  if (discountType !== "percent" && discountType !== "fixed") {
    throw new Error("Choose a valid discount type.");
  }

  const discountValue =
    discountType === "percent"
      ? Number.parseInt(rawDiscountValue, 10)
      : dollarsToCents(rawDiscountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    throw new Error("Discount value must be greater than zero.");
  }
  if (discountType === "percent" && discountValue > 100) {
    throw new Error("Percent discounts cannot exceed 100.");
  }

  await createReferralCode({
    partnerId,
    code,
    discountType,
    discountValue,
    minSubtotalCents: Math.max(0, dollarsToCents(rawMinSubtotal)),
    allowReconstitutionSolution: formData.get("allowReconstitutionSolution") === "on",
    active: formData.get("active") === "on",
  });
  revalidatePath("/admin/referrals");
}

function dollarsToCents(value: string) {
  if (!value) return 0;
  const parsed = Number.parseFloat(value.replace(/[$,]/g, ""));
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100);
}
