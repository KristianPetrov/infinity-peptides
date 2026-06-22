import { requireAdminUser } from "@/lib/auth/session";

export async function isAdminAuthenticated() {
  try {
    await requireAdminUser();
    return true;
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  return requireAdminUser();
}
