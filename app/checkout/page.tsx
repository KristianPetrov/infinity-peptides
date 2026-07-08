"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "../components/CartProvider";
import { formatPrice } from "@/lib/products";
import { createCheckoutOrder } from "./actions";

const ZELLE_RECIPIENT =
  process.env.NEXT_PUBLIC_ZELLE_RECIPIENT || "payments@infinity-peptides.com";
const VENMO_HANDLE = process.env.NEXT_PUBLIC_VENMO_HANDLE || "@InfinityPeptides";

const SHIPPING = {
  standard: { label: "Standard shipping", note: "Discreet · 3–5 business days", cents: 1500 },
  overnight: { label: "Overnight shipping", note: "Priority · next business day", cents: 5000 },
} as const;

type ShippingKey = keyof typeof SHIPPING;
type PaymentKey = "zelle" | "venmo";

function venmoLink(handle: string, totalCents: number, ref: string) {
  const params = new URLSearchParams({
    txn: "pay",
    audience: "private",
    recipients: handle.replace(/^@/, ""),
    amount: (totalCents / 100).toFixed(2),
    note: ref,
  });
  return `https://venmo.com/?${params.toString()}`;
}

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
};

export default function CheckoutPage() {
  const { items, subtotalCents, clear } = useCart();
  const [form, setForm] = useState(EMPTY_FORM);
  const [shipping, setShipping] = useState<ShippingKey>("standard");
  const [payment, setPayment] = useState<PaymentKey>("zelle");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<null | {
    reference: string;
    email: string;
    totalCents: number;
    paymentMethod: PaymentKey;
  }>(null);

  const shippingCents = SHIPPING[shipping].cents;
  const totalCents = subtotalCents + shippingCents;

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const required: (keyof typeof form)[] = [
      "fullName",
      "email",
      "address1",
      "city",
      "state",
      "postalCode",
      "country",
    ];
    const missing = required.filter((k) => !form[k].trim());
    if (missing.length) {
      setError("Please complete all required shipping fields.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!accepted) {
      setError("Please confirm the Research Use Only acknowledgement.");
      return;
    }
    setError("");
    setSubmitting(true);
    const result = await createCheckoutOrder({
      items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
      shippingMethod: shipping,
      paymentMethod: payment,
      acceptedTerms: accepted,
      shippingAddress: form,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOrder(result.order);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------------- Confirmation view ----------------
  if (order) {
    const summaryLines = [
      `Order reference: ${order.reference}`,
      `Total due: ${formatPrice(order.totalCents)}`,
      `Payment options: Zelle (${ZELLE_RECIPIENT}) or Venmo (${VENMO_HANDLE})`,
    ].join("%0D%0A");
    const mailto = `mailto:orders@infinity-peptides.com?subject=${encodeURIComponent(
      `Order ${order.reference}`,
    )}&body=${summaryLines}`;

    return (
      <div className="confirm">
        <div className="confirm-badge">✓</div>
        <p className="eyebrow">Order received · payment pending</p>
        <h1>Thank you for your order</h1>
        <p className="lead" style={{ maxWidth: 560, margin: "0 auto" }}>
          A confirmation email with these payment instructions was sent to{" "}
          <strong style={{ color: "var(--foreground, #f4f7fc)" }}>
            {order.email}
          </strong>
          . Pay with <strong>either</strong> Zelle or Venmo below — only one
          payment is needed.
        </p>
        <span className="ref">{order.reference}</span>

        <div className="pay-grid">
          <div className="pay-card">
            <h4>Option 1 · Zelle</h4>
            <p>{ZELLE_RECIPIENT}</p>
            <small>
              In your banking app, send {formatPrice(order.totalCents)} to this
              address and put <strong>{order.reference}</strong> in the memo.
            </small>
          </div>
          <div className="pay-card">
            <h4>Option 2 · Venmo</h4>
            <p>{VENMO_HANDLE}</p>
            <small>
              Send {formatPrice(order.totalCents)} with{" "}
              <strong>{order.reference}</strong> in the note, or{" "}
              <a
                href={venmoLink(VENMO_HANDLE, order.totalCents, order.reference)}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--cyan)", textDecoration: "underline" }}
              >
                open Venmo with the amount prefilled →
              </a>
            </small>
          </div>
        </div>

        <div
          className="field-card"
          style={{ maxWidth: 560, margin: "0 auto 26px", textAlign: "left" }}
        >
          <h3>Payment steps</h3>
          <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9, color: "var(--muted)" }}>
            <li>Pick Zelle or Venmo — whichever is easier for you.</li>
            <li>
              Send the exact total of{" "}
              <strong>{formatPrice(order.totalCents)}</strong>.
            </li>
            <li>
              Include your order reference <strong>{order.reference}</strong>{" "}
              in the memo / note so we can match your payment.
            </li>
            <li>
              Once payment is verified you&apos;ll receive a receipt email, and
              a tracking number when your order ships.
            </li>
          </ol>
        </div>

        <div className="hero-actions" style={{ justifyContent: "center" }}>
          <a className="button-primary" href={mailto}>
            Email order confirmation
          </a>
          <Link className="button-secondary" href="/store">
            Continue browsing
          </Link>
        </div>

        <p className="pdp-ruo" style={{ maxWidth: 560, margin: "30px auto 0" }}>
          <strong>For Research Use Only.</strong> Once payment is verified your
          order is prepared for shipment and a tracking reference is issued.
        </p>
      </div>
    );
  }

  // ---------------- Empty cart ----------------
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h1>Your cart is empty</h1>
        <p>Add reference compounds from the catalog to begin checkout.</p>
        <Link className="button-primary" href="/store">
          Browse the catalog
        </Link>
      </div>
    );
  }

  // ---------------- Checkout form ----------------
  return (
    <div className="page-hero" style={{ paddingBottom: 0 }}>
      <p className="eyebrow">Secure checkout</p>
      <h1 className="page-title">
        Checkout <span className="gradient-text">&amp; payment</span>
      </h1>

      <form className="checkout" onSubmit={onSubmit} style={{ paddingTop: 32 }}>
        <div className="checkout-form">
          {/* Shipping details */}
          <section className="field-card">
            <h3>Shipping details</h3>
            <p className="hint">Where should this research order be delivered?</p>
            <div className="field-grid">
              <div className="field full">
                <label>Full name *</label>
                <input
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="field">
                <label>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="field">
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  autoComplete="tel"
                />
              </div>
              <div className="field full">
                <label>Address line 1 *</label>
                <input
                  value={form.address1}
                  onChange={(e) => update("address1", e.target.value)}
                  autoComplete="address-line1"
                />
              </div>
              <div className="field full">
                <label>Address line 2</label>
                <input
                  value={form.address2}
                  onChange={(e) => update("address2", e.target.value)}
                  autoComplete="address-line2"
                />
              </div>
              <div className="field">
                <label>City *</label>
                <input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  autoComplete="address-level2"
                />
              </div>
              <div className="field">
                <label>State / region *</label>
                <input
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  autoComplete="address-level1"
                />
              </div>
              <div className="field">
                <label>Postal code *</label>
                <input
                  value={form.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                  autoComplete="postal-code"
                />
              </div>
              <div className="field">
                <label>Country *</label>
                <input
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  autoComplete="country-name"
                />
              </div>
            </div>
          </section>

          {/* Shipping method */}
          <section className="field-card">
            <h3>Shipping method</h3>
            <p className="hint">Select a delivery speed.</p>
            <div className="option-row">
              {(Object.keys(SHIPPING) as ShippingKey[]).map((key) => (
                <label
                  key={key}
                  className={`option ${shipping === key ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shipping === key}
                    onChange={() => setShipping(key)}
                  />
                  <span className="option-body">
                    <strong>{SHIPPING[key].label}</strong>
                    <span>{SHIPPING[key].note}</span>
                  </span>
                  <span className="option-price">
                    {formatPrice(SHIPPING[key].cents)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Payment preference */}
          <section className="field-card">
            <h3>Preferred payment</h3>
            <p className="hint">
              Manual payment. You will receive both options on the confirmation
              screen.
            </p>
            <div className="option-row">
              <label className={`option ${payment === "zelle" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={payment === "zelle"}
                  onChange={() => setPayment("zelle")}
                />
                <span className="option-body">
                  <strong>Zelle</strong>
                  <span>{ZELLE_RECIPIENT}</span>
                </span>
              </label>
              <label className={`option ${payment === "venmo" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={payment === "venmo"}
                  onChange={() => setPayment("venmo")}
                />
                <span className="option-body">
                  <strong>Venmo</strong>
                  <span>{VENMO_HANDLE}</span>
                </span>
              </label>
            </div>
          </section>

          {/* RUO confirmation */}
          <div className="ruo-check">
            <input
              id="ruo"
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <label htmlFor="ruo">
              I confirm that I am a qualified researcher and that all products
              are purchased <strong>For Research Use Only</strong> — not for
              human or veterinary use, and strictly for in-vitro laboratory
              research and development.
            </label>
          </div>

          {error ? (
            <p style={{ color: "var(--danger, #ff7a90)", fontWeight: 600 }}>
              {error}
            </p>
          ) : null}
        </div>

        {/* Order summary */}
        <aside className="summary">
          <h3>Order summary</h3>
          {items.map((item) => (
            <div className="summary-line" key={item.slug}>
              <span className="name">
                {item.name}
                <small>
                  {item.strength} × {item.quantity}
                </small>
              </span>
              <span>{formatPrice(item.priceCents * item.quantity)}</span>
            </div>
          ))}
          <div className="summary-totals">
            <div>
              <span>Subtotal</span>
              <span>{formatPrice(subtotalCents)}</span>
            </div>
            <div>
              <span>Shipping</span>
              <span>{formatPrice(shippingCents)}</span>
            </div>
            <div className="grand">
              <span>Total</span>
              <span>{formatPrice(totalCents)}</span>
            </div>
          </div>
          <button
            type="submit"
            className="button-primary"
            style={{ width: "100%", marginTop: 18 }}
            disabled={submitting}
          >
            {submitting ? "Creating order..." : "Place order"}
          </button>
          <p className="cart-note" style={{ marginTop: 12 }}>
            Orders are created as pending payment. No card is charged — payment
            is sent manually after checkout.
          </p>
        </aside>
      </form>
    </div>
  );
}
