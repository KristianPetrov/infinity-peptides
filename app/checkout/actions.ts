"use server";

import { createOrder, checkoutPayloadSchema } from "@/lib/orders/service";
import { getCurrentUser } from "@/lib/auth/session";

export async function createCheckoutOrder(payload: unknown) {
  try {
    const parsed = checkoutPayloadSchema.parse(payload);
    const user = await getCurrentUser();
    const order = await createOrder(parsed, user?.role === "customer" ? user.id : null);
    return { ok: true as const, order };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Order could not be created. Please review your cart and try again.";
    return { ok: false as const, error: message };
  }
}
