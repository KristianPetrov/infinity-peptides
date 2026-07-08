import type { Metadata } from "next";
import { Reveal } from "../components/Reveal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Infinity Peptides handles your information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow">Legal</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="page-title">
            Privacy <span className="gradient-text">policy</span>
          </h1>
        </Reveal>
      </div>

      <div className="prose">
        <h2>Information we collect</h2>
        <p>
          We collect the information you provide to fulfill an order — your name,
          email, shipping address, phone number, and order details. We do not
          collect or store payment-card information, as payment is handled
          manually outside this site.
        </p>

        <h2>How we use information</h2>
        <p>
          Information is used solely to process, fulfill, and provide support for
          your order, including order confirmation, payment verification, and
          shipping notifications.
        </p>

        <h2>Local storage</h2>
        <p>
          Your shopping cart is stored in your browser&apos;s local storage so it
          persists between visits on the same device. This data stays on your
          device and is cleared when you complete checkout or empty your cart.
        </p>

        <h2>Sharing</h2>
        <p>
          We do not sell your information. We share data only with the service
          providers required to ship your order (for example, carriers) and where
          required by law.
        </p>

        <h2>Data retention</h2>
        <p>
          Order records are retained as needed for fulfillment, support, and
          legal compliance. You may request information about the data associated
          with your orders.
        </p>

        <h2>Contact</h2>
        <p>
          Privacy questions can be directed to{" "}
          <strong>privacy@infinity-peptides.com</strong>.
        </p>
      </div>
    </>
  );
}
