import type { Metadata } from "next";
import { Reveal } from "../components/Reveal";

export const metadata: Metadata = {
  title: "Terms of Sale",
  description: "Terms of sale for Infinity Peptides research compounds.",
};

export default function TermsPage() {
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow">Legal</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="page-title">
            Terms of <span className="gradient-text">sale</span>
          </h1>
        </Reveal>
      </div>

      <div className="prose">
        <div className="callout">
          <strong>For Research Use Only.</strong> Placing an order constitutes
          acceptance of these terms and the Research Use Only policy.
        </div>

        <h2>Orders &amp; pricing</h2>
        <p>
          All prices are listed in U.S. dollars and exclude shipping. Orders are
          created with a pending-payment status and are confirmed only after
          manual payment has been received and verified. We reserve the right to
          refuse or cancel any order.
        </p>

        <h2>Payment</h2>
        <p>
          Payment is collected manually via the methods presented at checkout
          (Zelle or Venmo). Your order reference must be included in the payment
          note. No payment-card processing occurs on this site.
        </p>

        <h2>Shipping</h2>
        <p>
          Please allow 24 hours to 48 hours to update tracking number Please
          double check your address to avoid delays. If package is returned to
          sender, we&apos;re not responsible for any additional shipping fees.
        </p>
        <p>
          We&apos;re not responsible for any lost or stolen packages. If your
          package is lost or stolen. Please contact USPS directly.
        </p>
        <p>
          We can always help you file a claim if your package is insured.
        </p>
        <p>
          Please let us know if you prefer other carriers like UPS, or FEDEX.
          Extra shipping difference will be your responsibility.
        </p>
        <p>
          Please contact us within 24-48 hours of receiving your package for any
          damage items.
        </p>
        <p>
          Thank you for your support!
        </p>

        <h2>Returns</h2>
        <p>
          Due to the nature of research materials, products are generally not
          eligible for return once shipped. If a shipment arrives damaged or
          incorrect, contact us promptly so we can review the issue.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          Products are supplied for in-vitro laboratory research only and without
          warranty of fitness for any other purpose. Infinity Peptides is not
          liable for any use of products outside their intended Research Use Only
          context.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about an order can be directed to{" "}
          <strong>orders@infinity-peptides.com</strong>.
        </p>
      </div>
    </>
  );
}
