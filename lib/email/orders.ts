import { Resend } from "resend";
import { formatPrice } from "@/lib/products";
import type { OrderWithItems } from "@/lib/orders/service";
import {
  orderStatusLabel,
  siteUrl,
  trackingUrl,
  venmoHandle,
  venmoLink,
  zelleRecipient,
  type OrderStatus,
} from "@/lib/orders/config";

const ruoFooter =
  "For Research Use Only. Not for human or veterinary use. Products are intended strictly for in-vitro laboratory research and development.";

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  idempotencyKey: string;
};

type EmailOptions = {
  idempotencyKey?: string;
};

async function sendEmail({ to, subject, html, idempotencyKey }: SendArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Infinity Peptides <orders@infinity-peptides.com>";

  if (!apiKey) {
    console.warn(`RESEND_API_KEY missing; skipped email "${subject}" to ${to}.`);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send(
    {
      from,
      to,
      subject,
      html,
    },
    { idempotencyKey },
  );

  if (error) {
    console.error(`Resend failed for ${idempotencyKey}: ${error.message}`);
  }
}

export async function sendOrderConfirmation(order: OrderWithItems) {
  await sendEmail({
    to: order.email,
    subject: `Order ${order.reference} received - payment pending`,
    idempotencyKey: `order-confirmation/${order.reference}`,
    html: layout(
      "Order received",
      `
        <p>Your Infinity Peptides order has been recorded as <strong>pending payment</strong>.</p>
        ${orderSummary(order)}
        <div class="panel">
          <h2>Manual payment</h2>
          <p><strong>Zelle:</strong> ${escapeHtml(zelleRecipient())}</p>
          <p><strong>Venmo:</strong> ${escapeHtml(venmoHandle())}</p>
          <p>Send <strong>${formatPrice(order.totalCents)}</strong> and include <strong>${order.reference}</strong> in the payment note.</p>
          <p><a href="${venmoLink(order.totalCents, order.reference)}">Open Venmo with amount prefilled</a></p>
        </div>
        <p><a href="${siteUrl()}/order/${order.reference}?email=${encodeURIComponent(order.email)}">View order details</a></p>
      `,
    ),
  });
}

export async function sendAdminNewOrder(order: OrderWithItems) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    console.warn(`ADMIN_NOTIFICATION_EMAIL missing; skipped admin email for ${order.reference}.`);
    return;
  }

  await sendEmail({
    to: adminEmail,
    subject: `New Infinity Peptides order ${order.reference}`,
    idempotencyKey: `admin-new-order/${order.reference}`,
    html: layout(
      "New order",
      `
        <p>A new order is ready for manual payment verification.</p>
        <div class="panel">
          <p><strong>Reference:</strong> ${order.reference}</p>
          <p><strong>Customer:</strong> ${escapeHtml(order.email)}</p>
          <p><strong>Total:</strong> ${formatPrice(order.totalCents)}</p>
          <p><strong>Preferred payment:</strong> ${order.paymentMethod}</p>
        </div>
        ${orderSummary(order)}
        <p><a href="${siteUrl()}/admin/orders">Open admin dashboard</a></p>
      `,
    ),
  });
}

export async function sendPendingPaymentReceipt(order: OrderWithItems, options: EmailOptions = {}) {
  await sendEmail({
    to: order.email,
    subject: `Order ${order.reference} is pending payment`,
    idempotencyKey: options.idempotencyKey ?? `order-pending-payment/${order.reference}`,
    html: layout(
      "Payment pending",
      `
        <p>Order <strong>${order.reference}</strong> is marked as <strong>pending payment</strong>.</p>
        ${orderSummary(order)}
        <div class="panel">
          <h2>Manual payment</h2>
          <p><strong>Zelle:</strong> ${escapeHtml(zelleRecipient())}</p>
          <p><strong>Venmo:</strong> ${escapeHtml(venmoHandle())}</p>
          <p>Send <strong>${formatPrice(order.totalCents)}</strong> and include <strong>${order.reference}</strong> in the payment note.</p>
          <p><a href="${venmoLink(order.totalCents, order.reference)}">Open Venmo with amount prefilled</a></p>
        </div>
        <p><a href="${siteUrl()}/order/${order.reference}?email=${encodeURIComponent(order.email)}">View order details</a></p>
      `,
    ),
  });
}

export async function sendPaymentReceived(order: OrderWithItems, options: EmailOptions = {}) {
  await sendEmail({
    to: order.email,
    subject: `Payment receipt for ${order.reference}`,
    idempotencyKey: options.idempotencyKey ?? `payment-received/${order.reference}`,
    html: layout(
      "Payment received",
      `
        <p>Payment has been marked received for order <strong>${order.reference}</strong>. Your order is being prepared for shipment.</p>
        ${orderSummary(order)}
      `,
    ),
  });
}

export async function sendOrderShipped(order: OrderWithItems, options: EmailOptions = {}) {
  const link = trackingUrl(order.carrier, order.trackingNumber);
  await sendEmail({
    to: order.email,
    subject: `Order ${order.reference} shipped`,
    idempotencyKey: options.idempotencyKey ?? `order-shipped/${order.reference}`,
    html: layout(
      "Order shipped",
      `
        <p>Your order has been marked shipped.</p>
        <div class="panel">
          <p><strong>Carrier:</strong> ${escapeHtml(order.carrier || "Carrier pending")}</p>
          <p><strong>Tracking:</strong> ${escapeHtml(order.trackingNumber || "Tracking pending")}</p>
          ${link ? `<p><a href="${link}">Track shipment</a></p>` : ""}
        </div>
        ${orderSummary(order)}
      `,
    ),
  });
}

export async function sendOrderCancelled(order: OrderWithItems, options: EmailOptions = {}) {
  await sendEmail({
    to: order.email,
    subject: `Order ${order.reference} canceled`,
    idempotencyKey: options.idempotencyKey ?? `order-cancelled/${order.reference}`,
    html: layout(
      "Order canceled",
      `
        <p>Order <strong>${order.reference}</strong> has been canceled. If payment was already sent, contact support with your order reference.</p>
        ${orderSummary(order)}
      `,
    ),
  });
}

export async function sendAdminOrderStatusUpdate(
  order: OrderWithItems,
  previousStatus: OrderStatus,
  options: EmailOptions = {},
) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    console.warn(`ADMIN_NOTIFICATION_EMAIL missing; skipped admin status email for ${order.reference}.`);
    return;
  }

  const link = trackingUrl(order.carrier, order.trackingNumber);
  const currentLabel = orderStatusLabel(order.status);
  const previousLabel = orderStatusLabel(previousStatus);

  await sendEmail({
    to: adminEmail,
    subject: `Order ${order.reference} marked ${currentLabel}`,
    idempotencyKey: options.idempotencyKey ?? `admin-order-status/${order.reference}/${order.status}`,
    html: layout(
      "Order status updated",
      `
        <p>Order <strong>${order.reference}</strong> changed from <strong>${escapeHtml(previousLabel)}</strong> to <strong>${escapeHtml(currentLabel)}</strong>.</p>
        <div class="panel">
          <p><strong>Reference:</strong> ${order.reference}</p>
          <p><strong>Customer:</strong> ${escapeHtml(order.email)}</p>
          <p><strong>Total:</strong> ${formatPrice(order.totalCents)}</p>
          <p><strong>Status:</strong> ${escapeHtml(currentLabel)}</p>
          ${
            order.status === "shipped"
              ? `
                <p><strong>Carrier:</strong> ${escapeHtml(order.carrier || "")}</p>
                <p><strong>Tracking:</strong> ${escapeHtml(order.trackingNumber || "")}</p>
                ${link ? `<p><a href="${link}">Track shipment</a></p>` : ""}
              `
              : ""
          }
        </div>
        ${orderSummary(order)}
        <p><a href="${siteUrl()}/admin/orders">Open admin dashboard</a></p>
      `,
    ),
  });
}

function layout(title: string, body: string) {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)} | Infinity Peptides</title>
    <style>
      body { margin: 0; background: #05070d; color: #f4f7fc; font-family: Arial, sans-serif; }
      .wrap { max-width: 680px; margin: 0 auto; padding: 32px 20px; }
      .card { border: 1px solid rgba(255,255,255,.14); border-radius: 18px; background: #0b1322; padding: 28px; }
      h1 { margin: 0 0 18px; font-size: 30px; line-height: 1.1; }
      h2 { margin: 0 0 12px; font-size: 17px; color: #e8c879; text-transform: uppercase; letter-spacing: .08em; }
      p { color: #c8d2e4; line-height: 1.6; }
      a { color: #4ee7f2; }
      table { width: 100%; border-collapse: collapse; margin: 18px 0; }
      th, td { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.1); text-align: left; color: #dce5f4; }
      th:last-child, td:last-child { text-align: right; }
      .panel { border: 1px solid rgba(255,255,255,.12); border-radius: 14px; padding: 16px 18px; background: rgba(255,255,255,.04); margin: 18px 0; }
      .footer { margin-top: 22px; color: #aeb7c7; font-size: 13px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>Infinity Peptides</h1>
        ${body}
        <p class="footer">${ruoFooter}</p>
      </div>
    </div>
  </body>
</html>`;
}

function orderSummary(order: OrderWithItems) {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)} <small>${escapeHtml(item.slug)}</small><br/><small>Qty ${item.quantity}</small></td>
          <td>${formatPrice(item.unitPriceCents * item.quantity)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <div class="panel">
      <h2>Order ${order.reference}</h2>
      <table>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr><th>Subtotal</th><td>${formatPrice(order.subtotalCents)}</td></tr>
          <tr><th>Shipping</th><td>${formatPrice(order.shippingCents)}</td></tr>
          <tr><th>Total</th><td><strong>${formatPrice(order.totalCents)}</strong></td></tr>
        </tfoot>
      </table>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
