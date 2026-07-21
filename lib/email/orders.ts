import { Resend } from "resend";
import { formatPrice } from "@/lib/products";
import type { OrderWithItems } from "@/lib/orders/service";
import { orderItemLabel } from "@/lib/orders/format";
import {
  appleCashMessageLink,
  appleCashPhoneDisplay,
  orderStatusLabel,
  paymentMethodLabel,
  siteUrl,
  trackingUrl,
  zelleRecipient,
  type OrderStatus,
} from "@/lib/orders/config";

const ruoFooter =
  "For Research Use Only. Not for human or veterinary use. Products are intended strictly for in-vitro laboratory research and development.";

// Site palette (mirrors app/globals.css design tokens).
const COLORS = {
  background: "#04060c",
  card: "#070b15",
  panel: "rgba(255, 255, 255, 0.05)",
  line: "rgba(255, 255, 255, 0.14)",
  foreground: "#f4f7fc",
  body: "#c8d2e4",
  muted: "#aab4c4",
  faint: "#6b7689",
  magenta: "#f450b9",
  violet: "#8b65ff",
  cyan: "#4ee7f2",
  gradient: "linear-gradient(100deg, #f450b9, #8b65ff 42%, #4ee7f2)",
} as const;

const FONT_STACK =
  "'Sora', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

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

export function renderOrderConfirmationEmail(order: OrderWithItems) {
  return layout(
    "Order received",
    `
      <p>Thank you — your Infinity Peptides order has been recorded as <strong>pending payment</strong>.</p>
      ${orderSummary(order)}
      ${paymentPanel(order)}
      ${ctaButton(
        `${siteUrl()}/order/${order.reference}?email=${encodeURIComponent(order.email)}`,
        "View order details",
      )}
    `,
  );
}

export async function sendOrderConfirmation(order: OrderWithItems) {
  await sendEmail({
    to: order.email,
    subject: `Order ${order.reference} received - payment pending`,
    idempotencyKey: `order-confirmation/${order.reference}`,
    html: renderOrderConfirmationEmail(order),
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
        ${adminCustomerPanel(order)}
        <div class="panel">
          <p><strong>Total:</strong> ${formatPrice(order.totalCents)}</p>
          <p><strong>Preferred payment:</strong> ${paymentMethodLabel(order.paymentMethod)}</p>
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
        ${paymentPanel(order)}
        ${ctaButton(
          `${siteUrl()}/order/${order.reference}?email=${encodeURIComponent(order.email)}`,
          "View order details",
        )}
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
        ${adminCustomerPanel(order)}
        <div class="panel">
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

function adminCustomerPanel(order: OrderWithItems) {
  const address = order.shippingAddress;
  const phone = address.phone?.trim();
  const lines = [
    address.address1,
    address.address2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.country,
  ].filter((line): line is string => Boolean(line?.trim()));

  return `
    <div class="panel" style="border:1px solid ${COLORS.line};border-radius:14px;padding:16px 18px;background:${COLORS.panel};margin:18px 0;">
      <h2 style="margin:0 0 12px;font-size:14px;color:${COLORS.cyan};text-transform:uppercase;letter-spacing:.14em;">Customer &amp; shipping</h2>
      <p style="margin:0 0 8px;color:${COLORS.body};"><strong style="color:${COLORS.foreground};">Reference:</strong> ${escapeHtml(order.reference)}</p>
      <p style="margin:0 0 8px;color:${COLORS.body};"><strong style="color:${COLORS.foreground};">Name:</strong> ${escapeHtml(address.fullName || "—")}</p>
      <p style="margin:0 0 8px;color:${COLORS.body};"><strong style="color:${COLORS.foreground};">Email:</strong> ${escapeHtml(order.email)}</p>
      <p style="margin:0 0 8px;color:${COLORS.body};"><strong style="color:${COLORS.foreground};">Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
      <p style="margin:0;color:${COLORS.body};line-height:1.6;">
        <strong style="color:${COLORS.foreground};">Ship to:</strong><br/>
        ${lines.map((line) => escapeHtml(line)).join("<br/>")}
      </p>
    </div>
  `;
}

// Manual payment panel showing both Zelle and Apple Cash with step-by-step
// instructions. Used on every payment-pending email.
function paymentPanel(order: OrderWithItems) {
  const total = formatPrice(order.totalCents);
  const ref = order.reference;

  return `
    <div class="panel" style="border:1px solid ${COLORS.line};border-radius:14px;padding:20px 22px;background:${COLORS.panel};margin:18px 0;">
      <h2 style="margin:0 0 6px;font-size:14px;color:${COLORS.cyan};text-transform:uppercase;letter-spacing:.14em;">How to pay</h2>
      <p style="margin:0 0 14px;color:${COLORS.body};line-height:1.6;">
        Send <strong style="color:${COLORS.foreground};">${total}</strong> using
        <strong style="color:${COLORS.foreground};">either</strong> option below — whichever is easier for you.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 10px;margin:0;">
        <tr>
          <td style="border:1px solid ${COLORS.line};border-radius:12px;padding:14px 16px;background:rgba(255,255,255,0.03);">
            <p style="margin:0 0 2px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:${COLORS.muted};">Option 1 · Zelle</p>
            <p style="margin:0;font-size:17px;font-weight:700;color:${COLORS.foreground};">${escapeHtml(zelleRecipient())}</p>
            <p style="margin:6px 0 0;color:${COLORS.body};font-size:14px;line-height:1.6;">
              In your banking app, send ${total} to the address above and put
              <strong style="color:${COLORS.foreground};">${ref}</strong> in the memo.
            </p>
          </td>
        </tr>
        <tr>
          <td style="border:1px solid ${COLORS.line};border-radius:12px;padding:14px 16px;background:rgba(255,255,255,0.03);">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0;">
                  <p style="margin:0 0 2px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:${COLORS.muted};">Option 2 · Apple Pay via iMessage</p>
                </td>
                <td align="right" style="padding:0 0 0 8px;">
                  <span style="display:inline-block;border:1px solid rgba(78,231,242,.35);border-radius:999px;padding:4px 8px;background:rgba(78,231,242,.1);color:${COLORS.cyan};font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;">iPhone only</span>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:17px;font-weight:700;color:${COLORS.foreground};">${escapeHtml(appleCashPhoneDisplay())}</p>
            <p style="margin:6px 0 0;color:${COLORS.body};font-size:14px;line-height:1.6;">
              On your iPhone, open the prefilled message, tap <strong style="color:${COLORS.foreground};">+</strong>,
              choose Apple Cash, and send <strong style="color:${COLORS.foreground};">${total}</strong>.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px 0 2px;width:auto;">
              <tr>
                <td style="border-radius:999px;background:#27c65f;">
                  <a href="${escapeHtml(appleCashMessageLink(order.totalCents, order.reference))}" style="display:inline-block;padding:10px 18px;font-weight:700;font-size:14px;color:#041109;text-decoration:none;border-radius:999px;">Open iMessage</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="margin:14px 0 0;color:${COLORS.body};font-size:14px;line-height:1.7;">
        <strong style="color:${COLORS.foreground};">Payment steps</strong><br/>
        1. Pick Zelle or Apple Pay via iMessage — only one payment is needed.<br/>
        2. Send the exact total of <strong style="color:${COLORS.foreground};">${total}</strong>.<br/>
        3. Include your order reference <strong style="color:${COLORS.foreground};">${ref}</strong> in the Zelle memo or iMessage so we can match your payment.<br/>
        4. Once your payment is verified you'll receive a receipt email, and a tracking number when your order ships.
      </p>
    </div>
  `;
}

function ctaButton(href: string, label: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px auto 6px;width:auto;">
      <tr>
        <td style="border-radius:999px;background:${COLORS.gradient};background-color:${COLORS.violet};">
          <a href="${href}" style="display:inline-block;padding:12px 28px;font-weight:700;font-size:15px;color:#04060c;text-decoration:none;border-radius:999px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function layout(title: string, body: string) {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>${escapeHtml(title)} | Infinity Peptides</title>
    <style>
      body { margin: 0; background: ${COLORS.background}; color: ${COLORS.foreground}; font-family: ${FONT_STACK}; }
      .wrap { max-width: 640px; margin: 0 auto; padding: 32px 20px; }
      .card { border: 1px solid ${COLORS.line}; border-radius: 18px; background: ${COLORS.card}; padding: 30px 28px; }
      h1 { margin: 0 0 18px; font-size: 28px; line-height: 1.15; color: ${COLORS.foreground}; }
      h2 { margin: 0 0 12px; font-size: 14px; color: ${COLORS.cyan}; text-transform: uppercase; letter-spacing: .14em; }
      p { color: ${COLORS.body}; line-height: 1.6; }
      a { color: ${COLORS.cyan}; }
      table { width: 100%; }
      .items th, .items td { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.1); text-align: left; color: #dce5f4; border-collapse: collapse; }
      .items th:last-child, .items td:last-child { text-align: right; }
      .panel { border: 1px solid ${COLORS.line}; border-radius: 14px; padding: 16px 18px; background: ${COLORS.panel}; margin: 18px 0; }
      .footer { margin-top: 22px; color: ${COLORS.faint}; font-size: 12px; line-height: 1.6; }
    </style>
  </head>
  <body style="margin:0;background:${COLORS.background};color:${COLORS.foreground};font-family:${FONT_STACK};">
    <div class="wrap" style="max-width:640px;margin:0 auto;padding:32px 20px;">
      <p style="margin:0 0 14px;text-align:center;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${COLORS.faint};">
        For Research Use Only · Not for human or veterinary use
      </p>
      <div class="card" style="border:1px solid ${COLORS.line};border-radius:18px;background:${COLORS.card};padding:0;overflow:hidden;">
        <div style="height:4px;background:${COLORS.gradient};background-color:${COLORS.violet};"></div>
        <div style="padding:30px 28px;">
          <div style="text-align:center;margin-bottom:22px;">
            <img src="${siteUrl()}/infinity-peptides-logo.png" width="150" alt="Infinity Peptides" style="display:block;margin:0 auto 4px;max-width:150px;height:auto;" />
            <p style="margin:0;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:${COLORS.muted};">Research Peptide Catalog</p>
          </div>
          <h1 style="margin:0 0 18px;font-size:28px;line-height:1.15;color:${COLORS.foreground};text-align:center;">${escapeHtml(title)}</h1>
          ${body}
          <p class="footer" style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.08);color:${COLORS.faint};font-size:12px;line-height:1.6;">
            ${ruoFooter}<br/>
            <a href="${siteUrl()}" style="color:${COLORS.muted};">infinity-peptides.com</a>
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function orderSummary(order: OrderWithItems) {
  const cell = `padding:10px 0;border-bottom:1px solid rgba(255,255,255,.1);text-align:left;color:#dce5f4;`;
  const cellRight = `${cell}text-align:right;`;

  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="${cell}">${escapeHtml(orderItemLabel(item))}<br/><small style="color:${COLORS.muted};">Qty ${item.quantity}</small></td>
          <td style="${cellRight}">${formatPrice(item.unitPriceCents * item.quantity)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <div class="panel" style="border:1px solid ${COLORS.line};border-radius:14px;padding:16px 18px;background:${COLORS.panel};margin:18px 0;">
      <h2 style="margin:0 0 12px;font-size:14px;color:${COLORS.cyan};text-transform:uppercase;letter-spacing:.14em;">Order ${order.reference}</h2>
      <table class="items" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0;">
        <tbody>${rows}</tbody>
        <tfoot>
          <tr><th style="${cell}">Subtotal</th><td style="${cellRight}">${formatPrice(order.subtotalCents)}</td></tr>
          <tr><th style="${cell}">Shipping</th><td style="${cellRight}">${formatPrice(order.shippingCents)}</td></tr>
          <tr><th style="${cell}border-bottom:none;color:${COLORS.foreground};">Total</th><td style="${cellRight}border-bottom:none;"><strong style="color:${COLORS.foreground};">${formatPrice(order.totalCents)}</strong></td></tr>
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
