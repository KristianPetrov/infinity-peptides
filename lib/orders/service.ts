import { randomInt } from "crypto";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { products as catalogProducts } from "@/lib/products";
import { db } from "@/lib/db";
import {
  orderItems,
  orders,
  productsTable,
  type DbOrder,
  type DbOrderItem,
  type DbProduct,
} from "@/lib/db/schema";
import { sendAdminNewOrder, sendOrderConfirmation } from "@/lib/email/orders";
import {
  sendOrderCancelled,
  sendOrderShipped,
  sendPaymentReceived,
} from "@/lib/email/orders";
import { SHIPPING_METHODS } from "./config";

const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const checkoutPayloadSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Your cart is empty."),
  shippingMethod: z.enum(["standard", "overnight"]),
  paymentMethod: z.enum(["zelle", "venmo"]),
  acceptedTerms: z.literal(true, {
    error: "Please confirm the Research Use Only acknowledgement.",
  }),
  shippingAddress: z.object({
    fullName: z.string().trim().min(2),
    email: z.string().trim().toLowerCase().email(),
    phone: z.string().trim().optional(),
    address1: z.string().trim().min(3),
    address2: z.string().trim().optional(),
    city: z.string().trim().min(2),
    state: z.string().trim().min(2),
    postalCode: z.string().trim().min(3),
    country: z.string().trim().min(2),
  }),
  referralCode: z.string().trim().optional(),
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;
export type OrderWithItems = DbOrder & { items: DbOrderItem[] };

export async function seedCatalogProducts() {
  for (const product of catalogProducts) {
    await db
      .insert(productsTable)
      .values({
        slug: product.slug,
        name: product.name,
        strength: product.strength,
        shortDescription: `${product.strength} - ${product.tag}`,
        description: product.description,
        category: product.category,
        priceCents: product.priceCents ?? null,
        image: "/infinity-peptides-logo.png",
        featured: product.featured ?? false,
        active: true,
      })
      .onConflictDoUpdate({
        target: productsTable.slug,
        set: {
          name: product.name,
          strength: product.strength,
          shortDescription: `${product.strength} - ${product.tag}`,
          description: product.description,
          category: product.category,
          priceCents: product.priceCents ?? null,
          image: "/infinity-peptides-logo.png",
          featured: product.featured ?? false,
          active: true,
          updatedAt: new Date(),
        },
      });
  }
}

export async function createOrder(payload: CheckoutPayload) {
  const input = checkoutPayloadSchema.parse(payload);
  await seedCatalogProducts();

  const slugs = [...new Set(input.items.map((item) => item.slug))];
  const productRows = await db
    .select()
    .from(productsTable)
    .where(inArray(productsTable.slug, slugs));

  const productBySlug = new Map(productRows.map((product) => [product.slug, product]));
  const lines = input.items.map((item) => {
    const product = productBySlug.get(item.slug);
    if (!product || !product.active || product.priceCents == null) {
      throw new Error("One or more products in your cart are no longer available.");
    }
    if (item.quantity > product.inventory) {
      throw new Error(`${product.name} ${product.strength} has only ${product.inventory} in stock.`);
    }
    return { product, quantity: item.quantity };
  });

  const subtotalCents = lines.reduce(
    (sum, line) => sum + (line.product.priceCents ?? 0) * line.quantity,
    0,
  );
  const shippingCents = SHIPPING_METHODS[input.shippingMethod].cents;
  const discountCents = 0;
  const totalCents = subtotalCents - discountCents + shippingCents;
  const reference = await makeUniqueReference();
  const shippingAddress = {
    ...input.shippingAddress,
    shippingMethod: input.shippingMethod,
  };

  const inserted = await db
    .insert(orders)
    .values({
      reference,
      email: input.shippingAddress.email,
      paymentMethod: input.paymentMethod,
      subtotalCents,
      shippingCents,
      discountCents,
      referralCode: input.referralCode ? normalizeReferralCode(input.referralCode) : null,
      totalCents,
      shippingAddress,
    })
    .returning();

  const order = inserted[0];
  if (!order) throw new Error("Order could not be created.");

  await db.insert(orderItems).values(
    lines.map(({ product, quantity }) => ({
      orderId: order.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      unitPriceCents: product.priceCents as number,
      quantity,
    })),
  );

  for (const { product, quantity } of lines) {
    await db
      .update(productsTable)
      .set({
        inventory: sql`${productsTable.inventory} - ${quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, product.id));
  }

  const orderWithItems = await getOrderByReference(reference);
  if (orderWithItems) {
    await Promise.all([
      sendOrderConfirmation(orderWithItems),
      sendAdminNewOrder(orderWithItems),
    ]);
  }

  return {
    reference,
    email: input.shippingAddress.email,
    totalCents,
    paymentMethod: input.paymentMethod,
  };
}

export async function getOrderByReference(reference: string): Promise<OrderWithItems | null> {
  const normalized = reference.trim().toUpperCase();
  const rows = await db.select().from(orders).where(eq(orders.reference, normalized)).limit(1);
  const order = rows[0];
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { ...order, items };
}

export async function findOrderForGuest(reference: string, email: string) {
  const normalizedRef = reference.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();
  const rows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.reference, normalizedRef), eq(orders.email, normalizedEmail)))
    .limit(1);
  return rows[0] ?? null;
}

export async function listOrders(limit = 100): Promise<OrderWithItems[]> {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
  const out: OrderWithItems[] = [];
  for (const order of rows) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    out.push({ ...order, items });
  }
  return out;
}

export async function listInventory(): Promise<DbProduct[]> {
  await seedCatalogProducts();
  return db.select().from(productsTable).orderBy(productsTable.category, productsTable.name);
}

export async function markOrderPaid(orderId: string) {
  await db
    .update(orders)
    .set({ status: "paid", updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  const order = await getOrderById(orderId);
  if (order) await sendPaymentReceived(order);
}

export async function markOrderShipped(orderId: string, carrier: string, trackingNumber: string) {
  await db
    .update(orders)
    .set({
      status: "shipped",
      carrier,
      trackingNumber,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));
  const order = await getOrderById(orderId);
  if (order) await sendOrderShipped(order);
}

export async function cancelOrder(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order || order.status === "cancelled") return;

  for (const item of order.items) {
    const rows = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.slug, item.slug))
      .limit(1);
    const product = rows[0];
    if (product) {
      await db
        .update(productsTable)
        .set({
          inventory: sql`${productsTable.inventory} + ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(productsTable.id, product.id));
    }
  }

  await db
    .update(orders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  const cancelled = await getOrderById(orderId);
  if (cancelled) await sendOrderCancelled(cancelled);
}

export async function updateInventoryItem(
  productId: string,
  values: { inventory: number; priceCents: number | null; active: boolean; featured: boolean },
) {
  await db
    .update(productsTable)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(productsTable.id, productId));
}

async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const order = rows[0];
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { ...order, items };
}

async function makeUniqueReference() {
  for (let attempt = 0; attempt < 8; attempt++) {
    let out = "";
    for (let i = 0; i < 6; i++) {
      out += REF_CHARS[randomInt(REF_CHARS.length)];
    }
    const reference = `INF-${out}`;
    const existing = await db.select().from(orders).where(eq(orders.reference, reference)).limit(1);
    if (existing.length === 0) return reference;
  }
  throw new Error("Could not generate a unique order reference.");
}

function normalizeReferralCode(code: string) {
  return code.toUpperCase().replace(/\s+/g, "");
}
