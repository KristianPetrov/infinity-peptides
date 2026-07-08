import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  catalogStats,
  formatPrice,
  getFeaturedProducts,
  products,
} from "@/lib/products";
import { ProductCard } from "./components/ProductCard";
import { Reveal } from "./components/Reveal";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const VALUE_PROPS = [
  {
    title: "Verified purity",
    body: "Every reference compound is presented for HPLC and mass-spectrometry verification with lot traceability built into the catalog.",
    icon: "M9 12l2 2 4-4M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z",
  },
  {
    title: "Transparent pricing",
    body: "Clear USD pricing across every vial and concentration. No hidden tiers — what you see in the catalog is what you order.",
    icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  },
  {
    title: "Compliance-first",
    body: "Research Use Only language is surfaced across the header, catalog, checkout, and every transactional touchpoint.",
    icon: "M4 6l8-3 8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z",
  },
];

export default function Home() {
  const featured = getFeaturedProducts();
  const ticker = [...featured, ...featured];
  const spotlight = [
    products.find((p) => p.slug === "nad-1000mg"),
    products.find((p) => p.slug === "retatrutide-30mg"),
    products.find((p) => p.slug === "bpc-157-tb-500-10mg"),
  ].filter(Boolean);

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="hero">
        <div className="hero-copy">
          <Reveal>
            <p className="eyebrow">infinity-peptides.com</p>
          </Reveal>
          <Reveal delay={80}>
            <h1>
              Research peptides,
              <span className="gradient-text">refined to infinity.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="hero-lede">
              A premium Research Use Only catalog built around clear pricing,
              polished lot presentation, and compliance-first design for
              qualified laboratory research teams.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="hero-actions">
              <Link className="button-primary" href="/store">
                Explore catalog
              </Link>
              <Link className="button-secondary" href="/science">
                Science &amp; quality
              </Link>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <div className="hero-meta">
              <div>
                <strong>{catalogStats.count}</strong>
                <span>Catalog items</span>
              </div>
              <div>
                <strong>{catalogStats.categories}</strong>
                <span>Research categories</span>
              </div>
              <div>
                <strong>{formatPrice(catalogStats.startingPriceCents)}</strong>
                <span>Entry pricing</span>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="molecule-field">
            <span className="bond b1" />
            <span className="bond b2" />
            <span className="bond b3" />
            <span className="atom a1" />
            <span className="atom a2" />
            <span className="atom a3" />
            <span className="atom a4" />
            <span className="atom a5" />
          </div>
          <div className="hero-orb">
            <span className="hero-ring hero-ring-1">
              <span className="node" />
            </span>
            <span className="hero-ring hero-ring-2">
              <span className="node" />
            </span>
            <Image
              className="hero-logo"
              src="/infinity-peptides-logo.png"
              alt="Infinity Peptides"
              width={1536}
              height={1024}
              sizes="(max-width: 820px) 70vw, 380px"
              priority
            />
            <span className="hero-spark s1" />
            <span className="hero-spark s2" />
            <span className="hero-spark s3" />
            <span className="hero-spark s4" />
          </div>
          <div className="hero-float-card hero-float-card-left">
            <span>RUO</span>
            <strong>Lab-ready catalog</strong>
          </div>
          <div className="hero-float-card hero-float-card-right">
            <span>Starting at</span>
            <strong>{formatPrice(catalogStats.startingPriceCents)}</strong>
          </div>
        </div>
      </section>

      {/* ---------------- Featured ticker ---------------- */}
      <div className="marquee" aria-label="Featured products">
        <div className="marquee-track">
          {ticker.map((p, i) => (
            <span key={`${p.slug}-${i}`}>
              {p.name} {p.strength} <b>{formatPrice(p.priceCents)}</b>
            </span>
          ))}
        </div>
      </div>

      {/* ---------------- Value props ---------------- */}
      <section className="section container">
        <div className="section-head">
          <Reveal>
            <p className="eyebrow">Why Infinity</p>
          </Reveal>
          <Reveal delay={80}>
            <h2>Built for serious research workflows</h2>
          </Reveal>
          <Reveal delay={140}>
            <p>
              The Infinity Peptides catalog is engineered around the things
              research teams actually need — verifiable quality, honest pricing,
              and an uncompromising compliance posture.
            </p>
          </Reveal>
        </div>
        <div className="value-grid">
          {VALUE_PROPS.map((v, i) => (
            <Reveal as="article" className="value-card" key={v.title} delay={i * 90}>
              <span className="value-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={v.icon} />
                </svg>
              </span>
              <h3>{v.title}</h3>
              <p>{v.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Catalog spotlight ---------------- */}
      <section className="section container">
        <div className="spotlight-panel">
          <div className="spotlight-copy">
            <Reveal>
              <p className="eyebrow">Fast-moving references</p>
            </Reveal>
            <Reveal delay={80}>
              <h2>
                A polished catalog for modern{" "}
                <span className="gradient-text">research procurement.</span>
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p>
                Browse clear vial presentations, compare concentrations, and
                build an order from a persistent cart before confirming Research
                Use Only status at checkout.
              </p>
            </Reveal>
          </div>
          <div className="spotlight-stack" aria-label="Catalog highlights">
            {spotlight.map((p, i) =>
              p ? (
                <Reveal
                  as="div"
                  className="spotlight-row"
                  key={p.slug}
                  delay={i * 90}
                >
                  <span className="spotlight-index">0{i + 1}</span>
                  <div>
                    <strong>
                      {p.name} {p.strength}
                    </strong>
                    <small>{p.category}</small>
                  </div>
                  <b>{formatPrice(p.priceCents)}</b>
                </Reveal>
              ) : null,
            )}
          </div>
        </div>
      </section>

      {/* ---------------- Featured products ---------------- */}
      <section className="section container" id="featured">
        <div className="section-head">
          <Reveal>
            <p className="eyebrow">Featured catalog</p>
          </Reveal>
          <Reveal delay={80}>
            <h2>Reference compounds in demand</h2>
          </Reveal>
          <Reveal delay={140}>
            <p>
              A curated selection from across our research categories. Browse the
              full catalog for every vial, concentration, and blend.
            </p>
          </Reveal>
        </div>
        <div className="product-grid">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 70}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
        <div style={{ marginTop: 38 }}>
          <Link className="button-secondary" href="/store">
            View all {catalogStats.count} products →
          </Link>
        </div>
      </section>

      {/* ---------------- Compliance band ---------------- */}
      <div className="compliance-band">
        <div className="compliance-inner">
          <Reveal>
            <div>
              <p className="eyebrow">Compliance</p>
              <h2>Research Use Only</h2>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p>
              All products displayed on infinity-peptides.com are intended
              strictly for in-vitro laboratory research and development. Products
              are <strong>not</strong> for human use, veterinary use, diagnostic,
              therapeutic, food, drug, or cosmetic use. By ordering you confirm
              that you are a qualified researcher.
            </p>
          </Reveal>
        </div>
      </div>

      {/* ---------------- CTA ---------------- */}
      <div className="cta-band">
        <Reveal>
          <div>
            <p className="eyebrow">Start your order</p>
            <h2 className="page-title">
              Ready when your <span className="gradient-text">research is.</span>
            </h2>
            <p className="lead">
              Add reference compounds to your cart and confirm shipping and
              manual payment preferences at checkout.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Link className="button-primary" href="/store">
            Browse the catalog
          </Link>
        </Reveal>
      </div>
    </>
  );
}
