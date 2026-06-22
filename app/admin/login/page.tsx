import type { Metadata } from "next";
import { loginAction } from "@/app/auth-actions";

export const metadata: Metadata = {
  title: "Admin Login",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="empty-state">
      <p className="eyebrow">Admin</p>
      <h1>Sign in to dashboard</h1>
      <p>Use the configured admin email and password to open the admin dashboard.</p>
      <form action={loginAction} className="track-card" style={{ textAlign: "left" }}>
        {error ? <p className="form-error">Invalid admin password.</p> : null}
        <input type="hidden" name="redirectTo" value="/admin/orders" />
        <div className="field">
          <label>Email</label>
          <input name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label>Password</label>
          <input name="password" type="password" autoComplete="current-password" />
        </div>
        <button type="submit" className="button-primary" style={{ width: "100%" }}>
          Sign in
        </button>
      </form>
    </div>
  );
}
