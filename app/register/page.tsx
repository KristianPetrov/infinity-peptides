import type { Metadata } from "next";
import Link from "next/link";
import { registerAction } from "../auth-actions";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="empty-state">
      <p className="eyebrow">Customer account</p>
      <h1>Create an account</h1>
      <p>Save your customer profile and view your Infinity Peptides order history.</p>
      <form action={registerAction} className="track-card" style={{ textAlign: "left" }}>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="field">
          <label>Name</label>
          <input name="name" autoComplete="name" required />
        </div>
        <div className="field">
          <label>Email</label>
          <input name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label>Password</label>
          <input name="password" type="password" autoComplete="new-password" required />
        </div>
        <button type="submit" className="button-primary" style={{ width: "100%" }}>
          Create account
        </button>
        <p className="cart-note" style={{ marginTop: 14 }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
