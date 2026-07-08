import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { findOrderForGuest } from "@/lib/orders/service";
import { Reveal } from "../components/Reveal";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Look up the latest status of your Infinity Peptides order using your order reference and checkout email.",
  alternates: { canonical: "/track" },
};

type Props = {
  searchParams: Promise<{ error?: string; reference?: string }>;
};

export default async function TrackPage({ searchParams }: Props) {
  const params = await searchParams;

  async function lookupOrder(formData: FormData) {
    "use server";
    const reference = String(formData.get("reference") || "");
    const email = String(formData.get("email") || "");
    if (!reference.trim() || !email.trim()) {
      redirect("/track?error=missing");
    }
    const order = await findOrderForGuest(reference, email);
    if (!order) {
      redirect(`/track?error=not-found&reference=${encodeURIComponent(reference.trim().toUpperCase())}`);
    }
    redirect(`/order/${order.reference}?email=${encodeURIComponent(order.email)}`);
  }

  return (
    <>
      <div className="page-hero" style={{ textAlign: "center" }}>
        <Reveal>
          <p className="eyebrow">Order tracking</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="page-title">
            Track your <span className="gradient-text">order</span>
          </h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="lead" style={{ maxWidth: 560, margin: "0 auto" }}>
            Enter your order reference and the email used at checkout to look up
            the latest status.
          </p>
        </Reveal>
      </div>

      <section style={{ paddingBottom: 96 }}>
        <div className="track-card">
          <h3 style={{ color: "#fff", fontSize: "1.3rem" }}>Order lookup</h3>
          {params.error ? (
            <p className="form-error">
              {params.error === "missing"
                ? "Please enter your order reference and email."
                : `No matching order found${params.reference ? ` for ${params.reference}` : ""}.`}
            </p>
          ) : null}
          <form action={lookupOrder}>
            <div className="field">
              <label>Order reference</label>
              <input name="reference" placeholder="INF-XXXXXX" defaultValue={params.reference || ""} />
            </div>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" placeholder="you@lab.com" />
            </div>
            <button type="submit" className="button-primary">
              Look up order
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
