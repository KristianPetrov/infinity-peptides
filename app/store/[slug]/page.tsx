import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatPrice,
  getProductBySlug,
  products,
} from "@/lib/products";
import { Vial, vialLabel } from "../../components/Vial";
import { ProductBuyPanel } from "../../components/ProductBuyPanel";
import { ProductCard } from "../../components/ProductCard";
import { Reveal } from "../../components/Reveal";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} ${product.strength}`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <>
      <article className="pdp" data-category={product.category}>
        <div
          className="pdp-visual"
          // expose the category accent for the glow
          data-category={product.category}
        >
          <Vial label={vialLabel(product.name)} />
        </div>

        <div className="pdp-info">
          <p className="breadcrumb">
            <Link href="/store">Store</Link> &nbsp;/&nbsp;{" "}
            <Link href={`/store#${product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
              {product.category}
            </Link>
          </p>
          <h1>{product.name}</h1>
          <span className="pdp-tag">{product.tag}</span>

          <div className="pdp-price">
            <strong>{formatPrice(product.priceCents)}</strong>
            <span>per research vial · USD</span>
          </div>

          <p className="pdp-desc">{product.description}</p>

          <ProductBuyPanel product={product} />

          <div className="pdp-meta">
            <div>
              <span>Presentation</span>
              <span>{product.strength}</span>
            </div>
            <div>
              <span>Category</span>
              <span>{product.category}</span>
            </div>
            <div>
              <span>Form</span>
              <span>Lyophilized powder</span>
            </div>
            <div>
              <span>Status</span>
              <span>Research Use Only</span>
            </div>
          </div>

          <p className="pdp-ruo">
            <strong>For Research Use Only.</strong> Not for human or veterinary
            use. This product is intended strictly for in-vitro laboratory
            research and development and is sold to qualified researchers only.
          </p>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="related">
          <h3>More in {product.category}</h3>
          <div className="product-grid">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 4) * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
