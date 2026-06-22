import type { Metadata } from "next";
import { formatPrice } from "@/lib/products";
import { requireAdmin } from "@/lib/admin/auth";
import { listInventory } from "@/lib/orders/service";
import { updateInventoryAction } from "../actions";
import { AdminShell } from "../AdminShell";

export const metadata: Metadata = {
  title: "Admin Inventory",
};

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  await requireAdmin();
  const products = await listInventory();

  return (
    <AdminShell>
      <div className="admin-list">
        {products.map((product) => (
          <form className="admin-card inventory-row" action={updateInventoryAction} key={product.id}>
            <input type="hidden" name="productId" value={product.id} />
            <div>
              <h3>
                {product.name} {product.strength}
              </h3>
              <p>{product.category}</p>
              <small>{product.slug}</small>
            </div>
            <label>
              Inventory
              <input name="inventory" type="number" min="0" defaultValue={product.inventory} />
            </label>
            <label>
              Price cents
              <input
                name="priceCents"
                type="number"
                min="0"
                defaultValue={product.priceCents ?? ""}
                placeholder="Inquiry"
              />
              <small>{formatPrice(product.priceCents ?? undefined)}</small>
            </label>
            <label className="check-row">
              <input name="active" type="checkbox" defaultChecked={product.active} />
              Active
            </label>
            <label className="check-row">
              <input name="featured" type="checkbox" defaultChecked={product.featured} />
              Featured
            </label>
            <button type="submit" className="card-cta card-cta-buy">
              Save
            </button>
          </form>
        ))}
      </div>
    </AdminShell>
  );
}
