import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  adminEmail,
  createSession,
  isConfiguredAdminEmail,
  type SessionUser,
} from "./session";

const emailSchema = z.string().trim().toLowerCase().email();

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Za-z]/, "Password must include a letter.")
    .regex(/[0-9]/, "Password must include a number."),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export type AuthResult =
  | { ok: true; role: "customer" | "admin"; redirectTo: string }
  | { ok: false; error: string };

export async function registerCustomer(input: z.infer<typeof registerSchema>): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid registration." };
  }

  if (isConfiguredAdminEmail(parsed.data.email)) {
    return { ok: false, error: "This email is reserved for the admin account." };
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (existing.length > 0) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordHash = await hash(parsed.data.password, 10);
  const inserted = await db
    .insert(users)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "customer",
      emailVerifiedAt: new Date(),
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });

  const user = inserted[0];
  if (!user) return { ok: false, error: "Account could not be created." };
  await createSession(user);
  return { ok: true, role: user.role, redirectTo: "/account" };
}

export async function loginWithCredentials(
  input: z.infer<typeof loginSchema>,
  redirectTo?: string,
): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid login." };
  }

  const adminPassword = process.env.ADMIN_DASHBOARD_PASSWORD || process.env.SEED_ADMIN_PASSWORD;
  if (isConfiguredAdminEmail(parsed.data.email)) {
    if (!adminPassword || !(await compareAdminPassword(parsed.data.password, adminPassword))) {
      return { ok: false, error: "Invalid email or password." };
    }

    const user: SessionUser = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "Infinity Admin",
      email: adminEmail(),
      role: "admin",
    };
    await createSession(user);
    return { ok: true, role: "admin", redirectTo: "/admin/orders" };
  }

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  const user = rows[0];
  if (!user || !(await compare(parsed.data.password, user.passwordHash))) {
    return { ok: false, error: "Invalid email or password." };
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  if (user.role === "admin") {
    return { ok: true, role: "admin", redirectTo: "/admin/orders" };
  }

  return { ok: true, role: "customer", redirectTo: safeRedirect(redirectTo, "/account") };
}

async function compareAdminPassword(input: string, configured: string) {
  // Allows plain env admin password without storing an admin row in the database.
  return input === configured;
}

function safeRedirect(value: string | undefined, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.startsWith("/admin")) return fallback;
  return value;
}
