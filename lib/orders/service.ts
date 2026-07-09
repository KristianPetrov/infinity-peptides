import { randomInt } from "crypto";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import { products as catalogProducts } from "@/lib/products";
import { db } from "@/lib/db";
import {
  orderItems,
  orders,
  productsTable,
  referralCodes,
  referralPartners,
  type DbOrder,
  type DbOrderItem,
  type DbProduct,
  type DbReferralCode,
  type DbReferralPartner,
} from "@/lib/db/schema";
import {
  sendAdminNewOrder,
  sendAdminOrderStatusUpdate,
  sendOrderCancelled,
  sendOrderConfirmation,
  sendPendingPaymentReceipt,
  sendOrderShipped,
  sendPaymentReceived,
} from "@/lib/email/orders";
import {
  ORDER_STATUSES,
  SHIPPING_CARRIERS,
  SHIPPING_METHODS,
  type OrderStatus,
} from "./config";

const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  carrier: z.string().trim().optional(),
  trackingNumber: z.string().trim().optional(),
});
const shippingCarrierSchema = z.enum(SHIPPING_CARRIERS);

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
export type ReferralCodeWithPartner = DbReferralCode & {
  partnerName: string;
  partnerEmail: string | null;
};

export type NewReferralPartnerInput = {
  name: string;
  email?: string | null;
  notes?: string | null;
  active: boolean;
};

export type NewReferralCodeInput = {
  partnerId: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minSubtotalCents: number;
  allowReconstitutionSolution: boolean;
  active: boolean;
};

export type UpdateOrderStatusInput = {
  status: string;
  carrier?: string | null;
  trackingNumber?: string | null;
};

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
        image: product.imageSrc ?? "/infinity-peptides-logo.png",
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
          image: product.imageSrc ?? "/infinity-peptides-logo.png",
          featured: product.featured ?? false,
          active: true,
          updatedAt: new Date(),
        },
      });
  }
}

export async function createOrder(payload: CheckoutPayload, userId?: string | null) {
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
      userId: userId ?? null,
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
      strength: product.strength,
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

export async function listOrdersForCustomer(userId: string, email: string): Promise<OrderWithItems[]> {
  const rows = await db
    .select()
    .from(orders)
    .where(or(eq(orders.userId, userId), eq(orders.email, email.trim().toLowerCase())))
    .orderBy(desc(orders.createdAt))
    .limit(100);
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

export async function listReferralPartners(): Promise<DbReferralPartner[]> {
  return db.select().from(referralPartners).orderBy(referralPartners.name);
}

export async function listReferralCodes(): Promise<ReferralCodeWithPartner[]> {
  return db
    .select({
      id: referralCodes.id,
      partnerId: referralCodes.partnerId,
      code: referralCodes.code,
      discountType: referralCodes.discountType,
      discountValue: referralCodes.discountValue,
      minSubtotalCents: referralCodes.minSubtotalCents,
      allowReconstitutionSolution: referralCodes.allowReconstitutionSolution,
      active: referralCodes.active,
      usedCount: referralCodes.usedCount,
      createdAt: referralCodes.createdAt,
      partnerName: referralPartners.name,
      partnerEmail: referralPartners.email,
    })
    .from(referralCodes)
    .innerJoin(referralPartners, eq(referralCodes.partnerId, referralPartners.id))
    .orderBy(referralCodes.code);
}

export async function createReferralPartner(values: NewReferralPartnerInput) {
  const inserted = await db
    .insert(referralPartners)
    .values({
      name: values.name,
      email: values.email || null,
      notes: values.notes || null,
      active: values.active,
    })
    .returning();
  return inserted[0] ?? null;
}

export async function createReferralCode(values: NewReferralCodeInput) {
  const normalizedCode = normalizeReferralCode(values.code);
  const inserted = await db
    .insert(referralCodes)
    .values({
      partnerId: values.partnerId,
      code: normalizedCode,
      discountType: values.discountType,
      discountValue: values.discountValue,
      minSubtotalCents: values.minSubtotalCents,
      allowReconstitutionSolution: values.allowReconstitutionSolution,
      active: values.active,
    })
    .returning();
  return inserted[0] ?? null;
}

export async function updateOrderStatus(orderId: string, values: UpdateOrderStatusInput) {
  const existing = await getOrderById(orderId);
  if (!existing) throw new Error("Order not found.");

  const input = updateOrderStatusSchema.parse({
    status: values.status,
    carrier: values.carrier ?? undefined,
    trackingNumber: values.trackingNumber ?? undefined,
  });
  const previousStatus = existing.status;
  const nextStatus = input.status;
  const nextCarrier = input.carrier || null;
  const nextTrackingNumber = input.trackingNumber || null;

  if (nextStatus === "shipped") {
    if (!nextCarrier) throw new Error("Choose a shipping carrier before marking shipped.");
    if (!shippingCarrierSchema.safeParse(nextCarrier).success) {
      throw new Error("Choose a supported shipping carrier.");
    }
    if (!nextTrackingNumber) {
      throw new Error("Enter a tracking number before marking shipped.");
    }
  }

  const carrier = nextStatus === "shipped" ? nextCarrier : null;
  const trackingNumber = nextStatus === "shipped" ? nextTrackingNumber : null;
  const statusChanged = previousStatus !== nextStatus;
  const shippingChanged =
    nextStatus === "shipped" &&
    (existing.carrier !== carrier || existing.trackingNumber !== trackingNumber);

  if (!statusChanged && !shippingChanged) return existing;

  if (previousStatus !== "cancelled" && nextStatus === "cancelled") {
    await restockOrderItems(existing);
  }

  if (previousStatus === "cancelled" && nextStatus !== "cancelled") {
    await reserveOrderItems(existing);
  }

  await db
    .update(orders)
    .set({
      status: nextStatus,
      carrier,
      trackingNumber,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  const updated = await getOrderById(orderId);
  if (!updated) throw new Error("Order could not be updated.");

  await sendStatusChangeEmails(updated, previousStatus);
  return updated;
}

export async function markOrderPaid(orderId: string) {
  return updateOrderStatus(orderId, { status: "paid" });
}

export async function markOrderShipped(orderId: string, carrier: string, trackingNumber: string) {
  return updateOrderStatus(orderId, { status: "shipped", carrier, trackingNumber });
}

export async function cancelOrder(orderId: string) {
  return updateOrderStatus(orderId, { status: "cancelled" });
}

async function restockOrderItems(order: OrderWithItems) {
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
}

async function reserveOrderItems(order: OrderWithItems) {
  for (const item of order.items) {
    const rows = await db
      .select({ id: productsTable.id, inventory: productsTable.inventory })
      .from(productsTable)
      .where(eq(productsTable.slug, item.slug))
      .limit(1);
    const product = rows[0];
    if (!product) throw new Error(`${item.name} is no longer available in inventory.`);
    if (product.inventory < item.quantity) {
      throw new Error(`${item.name} has only ${product.inventory} in stock.`);
    }
  }

  for (const item of order.items) {
    await db
      .update(productsTable)
      .set({
        inventory: sql`${productsTable.inventory} - ${item.quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.slug, item.slug));
  }
}

async function sendStatusChangeEmails(order: OrderWithItems, previousStatus: OrderStatus) {
  const keySuffix = `${order.reference}/${order.updatedAt.getTime()}`;
  const customerEmail =
    order.status === "pending_payment"
      ? sendPendingPaymentReceipt(order, {
          idempotencyKey: `order-pending-payment/${keySuffix}`,
        })
      : order.status === "paid"
        ? sendPaymentReceived(order, {
            idempotencyKey: `payment-received/${keySuffix}`,
          })
        : order.status === "shipped"
          ? sendOrderShipped(order, {
              idempotencyKey: `order-shipped/${keySuffix}`,
            })
          : sendOrderCancelled(order, {
              idempotencyKey: `order-cancelled/${keySuffix}`,
            });

  await Promise.all([
    customerEmail,
    sendAdminOrderStatusUpdate(order, previousStatus, {
      idempotencyKey: `admin-order-status/${keySuffix}`,
    }),
  ]);
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

export async function updateReferralCodeSettings(
  referralCodeId: string,
  values: { active: boolean; allowReconstitutionSolution: boolean },
) {
  await db.update(referralCodes).set(values).where(eq(referralCodes.id, referralCodeId));
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
