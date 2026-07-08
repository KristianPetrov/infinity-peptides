import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";

// Server component: reads the session cookie at request time and streams in
// after the static shell. Keeps the rest of the page fully prerenderable.
export async function HeaderAuthLink() {
  const user = await getCurrentUser();

  if (user?.role === "admin") return <Link href="/admin">Admin</Link>;
  if (user) return <Link href="/account">Account</Link>;
  return <Link href="/login">Login</Link>;
}
