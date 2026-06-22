import type { Metadata } from "next";
import { loginAdmin } from "../actions";

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
      <p>Enter the admin dashboard password configured in your environment.</p>
      <form action={loginAdmin} className="track-card" style={{ textAlign: "left" }}>
        {error ? <p className="form-error">Invalid admin password.</p> : null}
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
