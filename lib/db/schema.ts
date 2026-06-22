import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const userRole = pgEnum("user_role", ["customer", "admin"]);
export const orderStatus = pgEnum("order_status", [
  "pending_payment",
  "paid",
  "shipped",
  "cancelled",
]);
export const paymentMethod = pgEnum("payment_method", ["zelle", "venmo"]);
export const discountType = pgEnum("discount_type", ["percent", "fixed"]);
export const authTokenType = pgEnum("auth_token_type", [
  "email_verification",
  "password_reset",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRole("role").default("customer").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const authTokens = pgTable("auth_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: authTokenType("type").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const productsTable = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    strength: text("strength").notNull(),
    shortDescription: text("short_description").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    priceCents: integer("price_cents"),
    image: text("image").default("/infinity-peptides-logo.png").notNull(),
    inventory: integer("inventory").default(100).notNull(),
    featured: boolean("featured").default(false).notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("products_slug_idx").on(table.slug)],
);

export const referralPartners = pgTable("referral_partners", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  notes: text("notes"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const referralCodes = pgTable(
  "referral_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    partnerId: uuid("partner_id")
      .notNull()
      .references(() => referralPartners.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    discountType: discountType("discount_type").notNull(),
    discountValue: integer("discount_value").notNull(),
    minSubtotalCents: integer("min_subtotal_cents").default(0).notNull(),
    active: boolean("active").default(true).notNull(),
    usedCount: integer("used_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("referral_codes_code_idx").on(table.code)],
);

export type ShippingAddress = {
  fullName: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  shippingMethod?: "standard" | "overnight";
};

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: text("reference").notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    email: text("email").notNull(),
    status: orderStatus("status").default("pending_payment").notNull(),
    paymentMethod: paymentMethod("payment_method").notNull(),
    subtotalCents: integer("subtotal_cents").notNull(),
    shippingCents: integer("shipping_cents").notNull(),
    discountCents: integer("discount_cents").default(0).notNull(),
    referralCodeId: uuid("referral_code_id").references(() => referralCodes.id, {
      onDelete: "set null",
    }),
    referralCode: text("referral_code"),
    totalCents: integer("total_cents").notNull(),
    shippingAddress: jsonb("shipping_address").$type<ShippingAddress>().notNull(),
    trackingNumber: text("tracking_number"),
    carrier: text("carrier"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("orders_reference_idx").on(table.reference)],
);

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => productsTable.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  image: text("image").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
});

export type DbProduct = InferSelectModel<typeof productsTable>;
export type NewDbProduct = InferInsertModel<typeof productsTable>;
export type DbOrder = InferSelectModel<typeof orders>;
export type DbOrderItem = InferSelectModel<typeof orderItems>;
