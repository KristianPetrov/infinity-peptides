import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatPrice,
  getProductBySlug,
  getProductVariants,
  groupProducts,
  products,
  type Product,
} from "@/lib/products";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";
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
    title: `${product.name} ${product.strength} — Research Use Only`,
    description: product.description,
    alternates: { canonical: `/store/${product.slug}` },
    openGraph: {
      type: "website",
      url: `/store/${product.slug}`,
      title: `${product.name} ${product.strength} | ${SITE_NAME}`,
      description: product.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} ${product.strength} | ${SITE_NAME}`,
      description: product.description,
    },
  };
}

function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} ${product.strength}`,
    description: product.description,
    sku: product.slug,
    category: product.category,
    url: absoluteUrl(`/store/${product.slug}`),
    image: product.imageSrc ? absoluteUrl(product.imageSrc) : undefined,
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(product.priceCents
      ? {
          offers: {
            "@type": "Offer",
            url: absoluteUrl(`/store/${product.slug}`),
            priceCurrency: "USD",
            price: (product.priceCents / 100).toFixed(2),
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@id": `${SITE_URL}/#organization` },
          },
        }
      : {}),
  };
}

function breadcrumbJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Store", item: absoluteUrl("/store") },
      {
        "@type": "ListItem",
        position: 3,
        name: `${product.name} ${product.strength}`,
        item: absoluteUrl(`/store/${product.slug}`),
      },
    ],
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const variants = getProductVariants(product);
  const related = groupProducts(
    products.filter(
      (p) => p.category === product.category && p.name !== product.name,
    ),
  ).slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productJsonLd(product), breadcrumbJsonLd(product)]),
        }}
      />
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

          {variants.length > 1 ? (
            <div className="pdp-strengths">
              <span>Available strengths</span>
              <div className="strength-options">
                {variants.map((variant) =>
                  variant.slug === product.slug ? (
                    <span
                      key={variant.slug}
                      className="strength-option is-active"
                      aria-current="page"
                    >
                      {variant.strength}
                    </span>
                  ) : (
                    <Link
                      key={variant.slug}
                      className="strength-option"
                      href={`/store/${variant.slug}`}
                    >
                      {variant.strength}
                    </Link>
                  ),
                )}
              </div>
            </div>
          ) : null}

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
              {product.certificateOfAnalysis.reportDate ? (
                <p>
                  Report date:{" "}
                  <strong>{product.certificateOfAnalysis.reportDate}</strong>
                </p>
              ) : null}
              {product.certificateOfAnalysis.purity ? (
                <p>
                  Purity:{" "}
                  <strong>{product.certificateOfAnalysis.purity}</strong>
                </p>
              ) : null}
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
            {related.map((group, i) => (
              <Reveal key={group.name} delay={(i % 4) * 60}>
                <ProductCard group={group} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
