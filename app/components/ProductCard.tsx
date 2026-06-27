import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { AddToCartButton } from "./AddToCartButton";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card" data-category={product.category}>
      <Link
        className={`product-visual ${product.imageSrc ? "has-product-image" : ""}`}
        href={`/store/${product.slug}`}
        aria-label={`View ${product.name} ${product.strength}`}
      >
        <ProductImage
          imageSrc={product.imageSrc}
          name={product.name}
          strength={product.strength}
        />
        {product.featured ? <span className="featured-pip">Featured</span> : null}
      </Link>
      <div className="product-copy">
        <p>{product.tag}</p>
        <h4>
          <Link href={`/store/${product.slug}`}>{product.name}</Link>
        </h4>
        <span className="product-strength">{product.strength}</span>
      </div>
      <div className="product-footer">
        <strong>{formatPrice(product.priceCents)}</strong>
        <div className="product-actions">
          <Link className="card-cta" href={`/store/${product.slug}`}>
            Details
          </Link>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
