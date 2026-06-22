import type { Metadata } from "next";
import { formatPrice } from "@/lib/products";
import { requireAdmin } from "@/lib/admin/auth";
import { listInventory, listOrders } from "@/lib/orders/service";
import { AdminShell } from "../AdminShell";

export const metadata: Metadata = {
  title: "Admin Analytics",
};

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const [orders, products] = await Promise.all([listOrders(500), listInventory()]);
  const confirmed = orders.filter((o) => o.status === "paid" || o.status === "shipped");
  const revenueCents = confirmed.reduce((sum, order) => sum + order.totalCents, 0);
  const unitsSold = confirmed.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );
  const aov = confirmed.length ? Math.round(revenueCents / confirmed.length) : 0;
  const lowStock = products.filter((product) => product.active && product.inventory <= 10);

  const statusCounts = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <AdminShell>
      <div className="admin-stats">
        <Stat label="Revenue" value={formatPrice(revenueCents)} />
        <Stat label="Orders" value={orders.length} />
        <Stat label="AOV" value={formatPrice(aov)} />
        <Stat label="Units sold" value={unitsSold} />
      </div>

      <div className="value-grid" style={{ marginTop: 24 }}>
        <article className="value-card">
          <h3>Status breakdown</h3>
          {Object.entries(statusCounts).map(([status, count]) => (
            <p key={status}>
              {status.replace("_", " ")}: <strong>{count}</strong>
            </p>
          ))}
        </article>
        <article className="value-card">
          <h3>Low stock</h3>
          {lowStock.length === 0 ? (
            <p>No active products are at or below 10 units.</p>
          ) : (
            lowStock.map((product) => (
              <p key={product.id}>
                {product.name} {product.strength}: <strong>{product.inventory}</strong>
              </p>
            ))
          )}
        </article>
        <article className="value-card">
          <h3>Catalog</h3>
          <p>
            Active products: <strong>{products.filter((p) => p.active).length}</strong>
          </p>
          <p>
            Featured products: <strong>{products.filter((p) => p.featured).length}</strong>
          </p>
          <p>
            Inquiry-only products: <strong>{products.filter((p) => p.priceCents == null).length}</strong>
          </p>
        </article>
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
