export const SHIPPING_METHODS = {
  standard: { label: "Standard shipping", note: "Discreet - 3-5 business days", cents: 1500 },
  overnight: { label: "Overnight shipping", note: "Priority - next business day", cents: 5000 },
} as const;

export const ORDER_STATUSES = ["pending_payment", "paid", "shipped", "cancelled"] as const;

export const ORDER_STATUS_OPTIONS = [
  { value: "pending_payment", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "shipped", label: "Shipped" },
  { value: "cancelled", label: "Canceled" },
] as const;

export const SHIPPING_CARRIERS = ["USPS", "UPS", "FedEx", "DHL"] as const;

export type ShippingMethod = keyof typeof SHIPPING_METHODS;
export type PaymentMethod = "zelle" | "venmo";
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type ShippingCarrier = (typeof SHIPPING_CARRIERS)[number];

export function orderStatusLabel(status: OrderStatus) {
  return ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function zelleRecipient() {
  return process.env.NEXT_PUBLIC_ZELLE_RECIPIENT || "payments@infinity-peptides.com";
}

export function venmoHandle() {
  return process.env.NEXT_PUBLIC_VENMO_HANDLE || "@InfinityPeptides";
}

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://infinity-peptides.com";
}

export function venmoLink(totalCents: number, reference: string) {
  const params = new URLSearchParams({
    txn: "pay",
    audience: "private",
    recipients: venmoHandle().replace(/^@/, ""),
    amount: (totalCents / 100).toFixed(2),
    note: reference,
  });
  return `https://venmo.com/?${params.toString()}`;
}

export function trackingUrl(carrier?: string | null, trackingNumber?: string | null) {
  if (!carrier || !trackingNumber) return null;
  const encoded = encodeURIComponent(trackingNumber);
  const key = carrier.toLowerCase();
  if (key.includes("usps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encoded}`;
  if (key.includes("ups")) return `https://www.ups.com/track?tracknum=${encoded}`;
  if (key.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${encoded}`;
  if (key.includes("dhl")) return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${encoded}`;
  return null;
}
