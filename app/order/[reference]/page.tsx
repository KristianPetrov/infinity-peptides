import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/products";
import { getOrderByReference } from "@/lib/orders/service";
import {
  orderStatusLabel,
  trackingUrl,
  venmoHandle,
  venmoLink,
  zelleRecipient,
} from "@/lib/orders/config";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ email?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Order ${reference.toUpperCase()}`,
  };
}

export default async function OrderPage({ params, searchParams }: Props) {
  const { reference } = await params;
  const { email } = await searchParams;
  const [order, user] = await Promise.all([getOrderByReference(reference), getCurrentUser()]);

  if (!order) redirect("/track?error=not-found");
  const canView =
    user?.role === "admin" ||
    user?.id === order.userId ||
    user?.email === order.email ||
    email?.trim().toLowerCase() === order.email;

  if (!canView) {
    redirect(`/track?reference=${encodeURIComponent(order.reference)}`);
  }

  const shipLink = trackingUrl(order.carrier, order.trackingNumber);

  return (
    <div className="confirm" style={{ textAlign: "left" }}>
      <p className="eyebrow">Order details</p>
      <h1>Order {order.reference}</h1>
      <span className="ref">{orderStatusLabel(order.status)}</span>

      <div className="pay-grid">
        <div className="pay-card">
          <h4>Total</h4>
          <p>{formatPrice(order.totalCents)}</p>
          <small>Preferred payment: {order.paymentMethod}</small>
        </div>
        <div className="pay-card">
          <h4>Placed by</h4>
          <p>{order.email}</p>
          <small>{new Date(order.createdAt).toLocaleString()}</small>
        </div>
      </div>

      {order.status === "pending_payment" ? (
        <div className="field-card" style={{ margin: "24px 0" }}>
          <h3>Manual payment instructions</h3>
          <p className="hint">Include your order reference in the payment note.</p>
          <div className="pay-grid" style={{ marginBottom: 0 }}>
            <div className="pay-card">
              <h4>Zelle</h4>
              <p>{zelleRecipient()}</p>
              <small>Send {formatPrice(order.totalCents)} with memo {order.reference}.</small>
            </div>
            <div className="pay-card">
              <h4>Venmo</h4>
              <p>{venmoHandle()}</p>
              <small>
                <a href={venmoLink(order.totalCents, order.reference)} target="_blank" rel="noreferrer">
                  Open Venmo with amount prefilled
                </a>
              </small>
            </div>
          </div>
        </div>
      ) : null}

      {order.status === "shipped" ? (
        <div className="field-card" style={{ margin: "24px 0" }}>
          <h3>Tracking</h3>
          <p className="hint">
            {order.carrier || "Carrier"} {order.trackingNumber || ""}
          </p>
          {shipLink ? (
            <a className="button-secondary" href={shipLink} target="_blank" rel="noreferrer">
              Track shipment
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="summary" style={{ position: "static" }}>
        <h3>Items</h3>
        {order.items.map((item) => (
          <div className="summary-line" key={item.id}>
            <span className="name">
              {item.name}
              <small>
                {item.slug} x {item.quantity}
              </small>
            </span>
            <span>{formatPrice(item.unitPriceCents * item.quantity)}</span>
          </div>
        ))}
        <div className="summary-totals">
          <div>
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotalCents)}</span>
          </div>
          <div>
            <span>Shipping</span>
            <span>{formatPrice(order.shippingCents)}</span>
          </div>
          <div className="grand">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>
      </div>

      <p className="pdp-ruo">
        <strong>For Research Use Only.</strong> Not for human or veterinary use.
      </p>

      <Link className="button-secondary" href="/store" style={{ marginTop: 24 }}>
        Continue browsing
      </Link>
    </div>
  );
}
