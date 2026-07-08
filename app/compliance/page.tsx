import type { Metadata } from "next";
import { Reveal } from "../components/Reveal";

export const metadata: Metadata = {
  title: "Research Use Only Policy",
  description:
    "The Infinity Peptides Research Use Only (RUO) policy. All products are for in-vitro laboratory research only.",
  alternates: { canonical: "/compliance" },
};

export default function CompliancePage() {
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow">Compliance</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="page-title">
            Research Use Only <span className="gradient-text">policy</span>
          </h1>
        </Reveal>
      </div>

      <div className="prose">
        <div className="callout">
          <strong>For Research Use Only. Not for human or veterinary use.</strong>{" "}
          All products are intended strictly for in-vitro laboratory research and
          development.
        </div>

        <h2>Scope</h2>
        <p>
          Every product listed on infinity-peptides.com is a research chemical
          sold exclusively to qualified researchers and institutions for
          laboratory research purposes. Products are not intended for human use,
          veterinary use, diagnostic use, therapeutic use, food use, drug use, or
          cosmetic use.
        </p>

        <h2>No medical claims</h2>
        <p>
          Nothing on this website should be interpreted as medical advice, dosing
          guidance, administration instructions, or a claim to diagnose, treat,
          cure, or prevent any disease or condition. Product descriptions
          reference preclinical and in-vitro research contexts only.
        </p>

        <h2>Buyer responsibility</h2>
        <p>
          By placing an order you represent and warrant that:
        </p>
        <ul>
          <li>You are at least the age of majority in your jurisdiction.</li>
          <li>
            You are a qualified researcher or acting on behalf of a research
            institution.
          </li>
          <li>
            You will handle, store, and dispose of all materials in accordance
            with applicable laws, regulations, and institutional protocols.
          </li>
          <li>
            You will not use any product for human or animal consumption or for
            any in-vivo application.
          </li>
        </ul>

        <h2>Handling &amp; safety</h2>
        <p>
          Research materials must be handled by trained personnel using
          appropriate laboratory controls and personal protective equipment.
          Reconstitution, storage, and disposal are the responsibility of the
          receiving laboratory.
        </p>

        <h2>Compliance &amp; jurisdiction</h2>
        <p>
          Laws regarding research chemicals vary by jurisdiction. It is your
          responsibility to confirm that the purchase, possession, and use of any
          product is lawful in your location before ordering.
        </p>
      </div>
    </>
  );
}
