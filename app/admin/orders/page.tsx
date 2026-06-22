import type { Metadata } from "next";
import { formatPrice } from "@/lib/products";
import { requireAdmin } from "@/lib/admin/auth";
import { listOrders } from "@/lib/orders/service";
import { cancelOrderAction, markPaidAction, shipOrderAction } from "../actions";
import { AdminShell } from "../AdminShell";

export const metadata: Metadata = {
  title: "Admin Orders",
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await listOrders();
  const stats = {
    pending: orders.filter((o) => o.status === "pending_payment").length,
    paid: orders.filter((o) => o.status === "paid").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
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
        <Stat label="Confirmed revenue" value={formatPrice(stats.revenueCents)} />
      </div>

      <div className="admin-list">
        {orders.length === 0 ? (
          <div className="field-card">
            <h3>No orders yet</h3>
            <p className="hint">Orders will appear here after checkout succeeds.</p>
          </div>
        ) : (
          orders.map((order) => (
            <article className="admin-card" key={order.id}>
              <div className="admin-card-head">
                <div>
                  <h3>{order.reference}</h3>
                  <p>{order.email}</p>
                </div>
                <span className="admin-status">{order.status.replace("_", " ")}</span>
              </div>

              <div className="summary-line">
                <span>Total</span>
                <strong>{formatPrice(order.totalCents)}</strong>
              </div>
              <div className="summary-line">
                <span>Payment preference</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="summary-line">
                <span>Created</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>

              <div className="admin-items">
                {order.items.map((item) => (
                  <span key={item.id}>
                    {item.name} {item.quantity}x
                  </span>
                ))}
              </div>

              <div className="admin-actions">
                {order.status === "pending_payment" ? (
                  <form action={markPaidAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button type="submit" className="card-cta card-cta-buy">
                      Mark paid
                    </button>
                  </form>
                ) : null}

                {order.status === "paid" ? (
                  <form action={shipOrderAction} className="ship-form">
                    <input type="hidden" name="orderId" value={order.id} />
                    <input name="carrier" placeholder="Carrier" required />
                    <input name="trackingNumber" placeholder="Tracking number" required />
                    <button type="submit" className="card-cta card-cta-buy">
                      Mark shipped
                    </button>
                  </form>
                ) : null}

                {order.status !== "cancelled" && order.status !== "shipped" ? (
                  <form action={cancelOrderAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button type="submit" className="card-cta">
                      Cancel
                    </button>
                  </form>
                ) : null}
              </div>
            </article>
          ))
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
