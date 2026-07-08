import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { loginAction } from "../auth-actions";

export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
  const redirectTo = params.redirectTo || "";

  if (user) {
    return (
      <div className="empty-state">
        <p className="eyebrow">Already signed in</p>
        <h1>Welcome back</h1>
        <p>You are signed in as {user.email}.</p>
        <Link className="button-primary" href={user.role === "admin" ? "/admin/orders" : "/account"}>
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <p className="eyebrow">Account</p>
      <h1>Sign in</h1>
      <p>
        Customers go to their account dashboard. The configured admin email goes
        directly to the admin dashboard.
      </p>
      <form action={loginAction} className="track-card" style={{ textAlign: "left" }}>
        {params.error ? <p className="form-error">{params.error}</p> : null}
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div className="field">
          <label>Email</label>
          <input name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label>Password</label>
          <input name="password" type="password" autoComplete="current-password" required />
        </div>
        <button type="submit" className="button-primary" style={{ width: "100%" }}>
          Sign in
        </button>
        <p className="cart-note" style={{ marginTop: 14 }}>
          New customer? <Link href="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
