import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { orderItems } from "../lib/db/schema";
import { getProductBySlug } from "../lib/products";

const items = await db.select().from(orderItems);
let updated = 0;

for (const item of items) {
  if (item.strength?.trim()) continue;
  const product = getProductBySlug(item.slug);
  if (!product?.strength) continue;
  await db
    .update(orderItems)
    .set({ strength: product.strength })
    .where(eq(orderItems.id, item.id));
  updated += 1;
}

console.log(`Backfilled strength on ${updated} of ${items.length} order items`);
