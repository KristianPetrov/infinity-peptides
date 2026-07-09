import { getProductBySlug } from "@/lib/products";

type OrderItemLike = {
  name: string;
  slug: string;
  strength?: string | null;
  quantity: number;
};

/** Display name with strength (mg) for order line items. */
export function orderItemLabel(item: OrderItemLike) {
  const strength =
    item.strength?.trim() || getProductBySlug(item.slug)?.strength || "";
  return strength ? `${item.name} ${strength}` : item.name;
}

export function orderItemQuantityLabel(item: OrderItemLike) {
  return `${orderItemLabel(item)} ${item.quantity}x`;
}
