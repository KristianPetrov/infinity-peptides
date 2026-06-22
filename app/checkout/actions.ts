"use server";

import { createOrder, checkoutPayloadSchema } from "@/lib/orders/service";

export async function createCheckoutOrder(payload: unknown) {
  try {
    const parsed = checkoutPayloadSchema.parse(payload);
    const order = await createOrder(parsed);
    return { ok: true as const, order };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Order could not be created. Please review your cart and try again.";
    return { ok: false as const, error: message };
  }
}
