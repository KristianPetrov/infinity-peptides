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
export type PaymentMethod = "zelle" | "apple_cash";
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type ShippingCarrier = (typeof SHIPPING_CARRIERS)[number];

export function orderStatusLabel(status: OrderStatus) {
  return ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function zelleRecipient() {
  return process.env.NEXT_PUBLIC_ZELLE_RECIPIENT || "payments@infinity-peptides.com";
}

export function appleCashPhone() {
  return process.env.NEXT_PUBLIC_APPLE_CASH_PHONE || "9514258610";
}

export function appleCashPhoneDisplay() {
  const digits = appleCashPhone().replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  if (digits.length !== 10) return appleCashPhone();
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function paymentMethodLabel(method: PaymentMethod) {
  return method === "zelle" ? "Zelle" : "Apple Pay via iMessage";
}

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://infinity-peptides.com";
}

export function appleCashMessageLink(totalCents: number, reference: string) {
  const digits = appleCashPhone().replace(/\D/g, "");
  const phone = digits.length === 10 ? `+1${digits}` : `+${digits}`;
  const amount = `$${(totalCents / 100).toFixed(2)}`;
  const message = `Infinity Peptides order ${reference} — ${amount} via Apple Cash`;

  // The ampersand separator opens a prefilled compose window in Messages on iPhone.
  return `sms:${phone}&body=${encodeURIComponent(message)}`;
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
