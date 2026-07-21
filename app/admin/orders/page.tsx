import type { Metadata } from "next";
import { formatPrice } from "@/lib/products";
import { requireAdmin } from "@/lib/admin/auth";
import { listOrders } from "@/lib/orders/service";
import { orderItemQuantityLabel } from "@/lib/orders/format";
import { orderStatusLabel, paymentMethodLabel, trackingUrl } from "@/lib/orders/config";
import { AdminShell } from "../AdminShell";
import { OrderStatusForm } from "./OrderStatusForm";

export const metadata: Metadata = {
  title: "Admin Orders",
};

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await listOrders();
  const stats = {
    pending: orders.filter((o) => o.status === "pending_payment").length,
    paid: orders.filter((o) => o.status === "paid").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    canceled: orders.filter((o) => o.status === "cancelled").length,
    revenueCents: orders
      .filter((o) => o.status === "paid" || o.status === "shipped")
      .reduce((sum, o) => sum + o.totalCents, 0),
  };

  return (
    <AdminShell>
      <div className="admin-stats">
        <Stat label="Pending" value={stats.pending} />
        <Stat label="Paid" value={stats.paid} />
        <Stat label="Shipped" value={stats.shipped} />
        <Stat label="Canceled" value={stats.canceled} />
        <Stat label="Confirmed revenue" value={formatPrice(stats.revenueCents)} />
      </div>

      <div className="admin-list">
        {orders.length === 0 ? (
          <div className="field-card">
            <h3>No orders yet</h3>
            <p className="hint">Orders will appear here after checkout succeeds.</p>
          </div>
        ) : (
          orders.map((order) => {
            const shipmentLink = trackingUrl(order.carrier, order.trackingNumber);

            return (
              <article className="admin-card" key={order.id}>
                <div className="admin-card-head">
                  <div>
                    <h3>{order.reference}</h3>
                    <p>{order.shippingAddress.fullName || order.email}</p>
                  </div>
                  <span className="admin-status">{orderStatusLabel(order.status)}</span>
                </div>

                <div className="summary-line">
                  <span>Email</span>
                  <a href={`mailto:${order.email}`}>{order.email}</a>
                </div>
                <div className="summary-line">
                  <span>Phone</span>
                  {order.shippingAddress.phone?.trim() ? (
                    <a href={`tel:${order.shippingAddress.phone}`}>
                      {order.shippingAddress.phone}
                    </a>
                  ) : (
                    <span>Not provided</span>
                  )}
                </div>
                <div className="summary-line" style={{ alignItems: "flex-start" }}>
                  <span>Ship to</span>
                  <span style={{ textAlign: "right", lineHeight: 1.5 }}>
                    {[
                      order.shippingAddress.address1,
                      order.shippingAddress.address2,
                      [
                        order.shippingAddress.city,
                        order.shippingAddress.state,
                        order.shippingAddress.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", "),
                      order.shippingAddress.country,
                    ]
                      .filter(Boolean)
                      .map((line) => (
                        <span key={line} style={{ display: "block" }}>
                          {line}
                        </span>
                      ))}
                  </span>
                </div>
                <div className="summary-line">
                  <span>Total</span>
                  <strong>{formatPrice(order.totalCents)}</strong>
                </div>
                <div className="summary-line">
                  <span>Payment preference</span>
                  <span>{paymentMethodLabel(order.paymentMethod)}</span>
                </div>
                <div className="summary-line">
                  <span>Created</span>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                {order.status === "shipped" ? (
                  <div className="summary-line">
                    <span>Tracking</span>
                    {shipmentLink ? (
                      <a href={shipmentLink} target="_blank" rel="noreferrer">
                        {order.carrier} {order.trackingNumber}
                      </a>
                    ) : (
                      <span>
                        {order.carrier} {order.trackingNumber}
                      </span>
                    )}
                  </div>
                ) : null}

                <div className="admin-items">
                  {order.items.map((item) => (
                    <span key={item.id}>{orderItemQuantityLabel(item)}</span>
                  ))}
                </div>

                <div className="admin-actions">
                  <OrderStatusForm
                    orderId={order.id}
                    status={order.status}
                    carrier={order.carrier}
                    trackingNumber={order.trackingNumber}
                  />
                </div>
              </article>
            );
          })
        )}
      </div>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="value-card">
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  );
}
