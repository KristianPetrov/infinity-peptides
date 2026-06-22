import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "inf-session";
const MAX_AGE = 60 * 60 * 24 * 14;

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  role: "customer" | "admin";
};

type SessionPayload = {
  user: SessionUser;
  exp: number;
};

function authSecret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_DASHBOARD_SECRET || "dev-auth-secret";
}

function sign(value: string) {
  return createHmac("sha256", authSecret()).update(value).digest("base64url");
}

function encode(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(value?: string): SessionPayload | null {
  if (!value) return null;
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  if (signature.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  return decode(cookie)?.user ?? null;
}

export async function createSession(user: SessionUser) {
  const payload: SessionPayload = {
    user,
    exp: Date.now() + MAX_AGE * 1000,
  };

  (await cookies()).set(SESSION_COOKIE, encode(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/account");
  return user;
}

export async function requireAdminUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/admin/orders");
  if (user.role !== "admin") redirect("/account");
  return user;
}

export function adminEmail() {
  return (process.env.ADMIN_EMAIL || process.env.SEED_ADMIN_EMAIL || "").trim().toLowerCase();
}

export function isConfiguredAdminEmail(email: string) {
  const configured = adminEmail();
  return Boolean(configured && email.trim().toLowerCase() === configured);
}
