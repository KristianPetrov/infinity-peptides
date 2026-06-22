import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "inf-admin-session";

function secret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_DASHBOARD_SECRET || "dev-admin-secret";
}

function expectedToken() {
  return createHmac("sha256", secret()).update("admin").digest("hex");
}

export async function isAdminAuthenticated() {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return false;
  const expected = expectedToken();
  if (value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function createAdminSession() {
  (await cookies()).set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export function validateAdminPassword(password: string) {
  const configured = process.env.ADMIN_DASHBOARD_PASSWORD || process.env.SEED_ADMIN_PASSWORD;
  if (!configured) return false;
  if (password.length !== configured.length) return false;
  return timingSafeEqual(Buffer.from(password), Buffer.from(configured));
}
