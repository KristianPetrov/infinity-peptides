import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../components/Reveal";

export const metadata: Metadata = {
  title: "Science & Quality",
  description:
    "Infinity Peptides quality standards: HPLC and mass-spectrometry verification, lyophilization, and lot traceability for Research Use Only compounds.",
  alternates: { canonical: "/science" },
};

const STANDARDS = [
  {
    num: "01",
    title: "HPLC & MS verification",
    body: "Reference compounds are presented for high-performance liquid chromatography and mass-spectrometry verification so identity and purity can be confirmed against documentation.",
  },
  {
    num: "02",
    title: "Lyophilized integrity",
    body: "Peptides are supplied as lyophilized powder for stability during storage and transit, ready for reconstitution in qualified laboratory environments.",
  },
  {
    num: "03",
    title: "Lot traceability",
    body: "Catalog architecture is built for lot numbers and assay records, keeping each vial traceable from listing through fulfillment.",
  },
];

const PROCESS = [
  {
    step: "1",
    title: "Sourcing & synthesis",
    body: "Compounds are sourced as research-grade material with synthesis records suitable for laboratory reference work.",
  },
  {
    step: "2",
    title: "Analytical verification",
    body: "Identity and purity are presented for HPLC and mass-spectrometry verification before a lot is listed in the catalog.",
  },
  {
    step: "3",
    title: "Lyophilization & vialing",
    body: "Material is lyophilized and vialed under controlled conditions to preserve integrity through storage and shipment.",
  },
  {
    step: "4",
    title: "Lot release & listing",
    body: "Each released lot is tied to its catalog entry, with traceable references carried through to the order record.",
  },
];

export default function SciencePage() {
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow">Science &amp; quality</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="page-title">
            Quality you can <span className="gradient-text">verify.</span>
          </h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="lead" style={{ maxWidth: 720 }}>
            Infinity Peptides is built around verifiable quality. Every reference
            compound is presented with the documentation a research team needs to
            confirm identity, purity, and lot lineage.
          </p>
        </Reveal>
      </div>

      <section className="section container" style={{ paddingTop: 56 }}>
        <div className="standards-grid">
          {STANDARDS.map((s, i) => (
            <Reveal as="article" key={s.num} delay={i * 90}>
              <span className="num">{s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="section-head" style={{ marginTop: 80 }}>
            <p className="eyebrow">Process</p>
            <h2>From synthesis to shelf</h2>
            <p>
              A consistent, documentation-driven path keeps every vial accountable
              to its lot.
            </p>
          </div>
        </Reveal>

        <div className="process-list">
          {PROCESS.map((p, i) => (
            <Reveal as="div" className="process-step" key={p.step} delay={i * 70}>
              <span className="step-num">{p.step}</span>
              <div>
                <h4>{p.title}</h4>
                <p>{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="compliance-band">
        <div className="compliance-inner">
          <Reveal>
            <div>
              <p className="eyebrow">Reminder</p>
              <h2>Research Use Only</h2>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p>
              All analytical and quality information is provided to support
              in-vitro laboratory research. No statement on this page constitutes
              a human-use, veterinary, diagnostic, or therapeutic claim.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="cta-band">
        <div>
          <p className="eyebrow">Explore</p>
          <h2 className="page-title">Browse the catalog</h2>
        </div>
        <Link className="button-primary" href="/store">
          View all products
        </Link>
      </div>
    </>
  );
}
