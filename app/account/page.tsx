import type { Metadata } from "next";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import { requireUser } from "@/lib/auth/session";
import { listOrdersForCustomer } from "@/lib/orders/service";
import { logoutAction } from "../auth-actions";

export const metadata: Metadata = {
  title: "Account",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();
  if (user.role === "admin") {
    return (
      <div className="empty-state">
        <p className="eyebrow">Admin account</p>
        <h1>Admin dashboard</h1>
        <p>This account has admin access.</p>
        <Link className="button-primary" href="/admin/orders">
          Open admin dashboard
        </Link>
      </div>
    );
  }

  const orders = await listOrdersForCustomer(user.id, user.email);
  const totalSpent = orders
    .filter((order) => order.status === "paid" || order.status === "shipped")
    .reduce((sum, order) => sum + order.totalCents, 0);

  return (
    <section className="admin-shell">
      <div className="admin-head">
        <div>
          <p className="eyebrow">Customer account</p>
          <h1>Welcome{user.name ? `, ${user.name}` : ""}</h1>
          <p className="lead" style={{ maxWidth: 680 }}>
            View your profile details, order history, payment status, and tracking
            information.
          </p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="button-secondary">
            Sign out
          </button>
        </form>
      </div>

      <div className="admin-stats">
        <Stat label="Email" value={user.email} />
        <Stat label="Orders" value={orders.length} />
        <Stat label="Confirmed spend" value={formatPrice(totalSpent)} />
        <Stat label="Account type" value="Customer" />
      </div>

      <div className="field-card" style={{ marginBottom: 24 }}>
        <h3>Customer info</h3>
        <p className="hint">This is the customer information currently saved on your account.</p>
        <div className="pdp-meta">
          <div>
            <span>Name</span>
            <span>{user.name || "Not provided"}</span>
          </div>
          <div>
            <span>Email</span>
            <span>{user.email}</span>
          </div>
          <div>
            <span>Role</span>
            <span>{user.role}</span>
          </div>
        </div>
      </div>

      <div className="admin-list">
        <h2 className="page-title" style={{ fontSize: "2rem" }}>
          Your orders
        </h2>
        {orders.length === 0 ? (
          <div className="field-card">
            <h3>No orders yet</h3>
            <p className="hint">Orders placed while signed in will appear here.</p>
            <Link className="button-primary" href="/store">
              Browse catalog
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <article className="admin-card" key={order.id}>
              <div className="admin-card-head">
                <div>
                  <h3>{order.reference}</h3>
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span className="admin-status">{order.status.replace("_", " ")}</span>
              </div>
              <div className="summary-line">
                <span>Total</span>
                <strong>{formatPrice(order.totalCents)}</strong>
              </div>
              <div className="admin-items">
                {order.items.map((item) => (
                  <span key={item.id}>
                    {item.name} {item.quantity}x
                  </span>
                ))}
              </div>
              <Link className="card-cta" href={`/order/${order.reference}`}>
                View order
              </Link>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="value-card">
      <p>{label}</p>
      <h3 style={{ wordBreak: "break-word" }}>{value}</h3>
    </div>
  );
}
