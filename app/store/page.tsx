import type { Metadata } from "next";
import {
  CATEGORY_BLURB,
  catalogStats,
  getProductsByCategory,
} from "@/lib/products";
import { ProductCard } from "../components/ProductCard";
import { Reveal } from "../components/Reveal";

export const metadata: Metadata = {
  title: "Research Peptide Store — Full RUO Catalog",
  description:
    "The full Infinity Peptides Research Use Only catalog, grouped by research category with clear USD pricing.",
  alternates: { canonical: "/store" },
};

function slug(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function StorePage() {
  const groups = getProductsByCategory();

  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow">Live catalog</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="page-title">
            Research <span className="gradient-text">catalog</span>
          </h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="lead" style={{ maxWidth: 680 }}>
            {catalogStats.count} reference compounds across{" "}
            {catalogStats.categories} categories. Pricing is shown in USD and
            does not include shipping or manual payment, which are confirmed at
            checkout.
          </p>
        </Reveal>
      </div>

      <section className="container" style={{ paddingBottom: 96 }}>
        <div className="catalog-rail" aria-label="Catalog category shortcuts">
          {groups.map(({ category, items }) => (
            <a href={`#${slug(category)}`} key={category}>
              <span>{category}</span>
              <b>{items.length}</b>
            </a>
          ))}
        </div>

        <div className="catalog-groups">
          {groups.map(({ category, items }) => (
            <section
              className="product-group"
              id={slug(category)}
              key={category}
            >
              <div className="group-heading">
                <div>
                  <h3>{category}</h3>
                  <p>{CATEGORY_BLURB[category]}</p>
                </div>
                <span>{items.length} products</span>
              </div>
              <div className="product-grid">
                {items.map((p, i) => (
                  <Reveal key={p.slug} delay={(i % 4) * 60}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
