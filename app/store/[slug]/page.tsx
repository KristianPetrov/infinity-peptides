import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatPrice,
  getProductBySlug,
  products,
} from "@/lib/products";
import { ProductImage } from "../../components/ProductImage";
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
    openGraph: product.imageSrc
      ? {
          images: [
            {
              url: product.imageSrc,
              width: 1254,
              height: 1254,
              alt: `${product.name} ${product.strength}`,
            },
          ],
        }
      : undefined,
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
          className={`pdp-visual ${product.imageSrc ? "has-product-image" : ""}`}
          // expose the category accent for the glow
          data-category={product.category}
        >
          <ProductImage
            imageSrc={product.imageSrc}
            name={product.name}
            strength={product.strength}
            priority
            sizes="(max-width: 820px) 100vw, 45vw"
          />
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
              <span>{product.form ?? "Lyophilized powder"}</span>
            </div>
            <div>
              <span>Status</span>
              <span>Research Use Only</span>
            </div>
          </div>

          {product.ingredients ? (
            <section className="pdp-spec-panel" aria-labelledby="ingredients-heading">
              <h2 id="ingredients-heading">Ingredients</h2>
              <ul className="ingredient-list">
                {product.ingredients.map((ingredient) => (
                  <li key={ingredient}>{ingredient}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {product.certificateOfAnalysis ? (
            <section className="pdp-spec-panel" aria-labelledby="coa-heading">
              <h2 id="coa-heading">Certificate of Analysis</h2>
              <p>
                Search code:{" "}
                <strong>{product.certificateOfAnalysis.code}</strong>
              </p>
              <a
                className="coa-link"
                href={product.certificateOfAnalysis.url}
                target="_blank"
                rel="noreferrer"
              >
                View COA
              </a>
            </section>
          ) : null}

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
