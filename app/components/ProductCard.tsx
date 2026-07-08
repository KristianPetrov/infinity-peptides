"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProductGroup } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { AddToCartButton } from "./AddToCartButton";
import { ProductImage } from "./ProductImage";

export function ProductCard({
  group,
  defaultSlug,
}: {
  group: ProductGroup;
  defaultSlug?: string;
}) {
  const initial =
    group.variants.find((v) => v.slug === defaultSlug) ??
    group.variants.find((v) => v.priceCents != null) ??
    group.variants[0];
  const [selected, setSelected] = useState(initial);
  const hasOptions = group.variants.length > 1;

  return (
    <article className="product-card" data-category={group.category}>
      <Link
        className={`product-visual ${selected.imageSrc ? "has-product-image" : ""}`}
        href={`/store/${selected.slug}`}
        aria-label={`View ${selected.name} ${selected.strength}`}
      >
        <ProductImage
          key={selected.slug}
          imageSrc={selected.imageSrc}
          name={selected.name}
          strength={selected.strength}
        />
        {group.featured ? <span className="featured-pip">Featured</span> : null}
      </Link>
      <div className="product-copy">
        <p>{group.tag}</p>
        <h4>
          <Link href={`/store/${selected.slug}`}>{group.name}</Link>
        </h4>
        {hasOptions ? (
          <div
            className="strength-options"
            role="group"
            aria-label={`${group.name} strength`}
          >
            {group.variants.map((variant) => (
              <button
                key={variant.slug}
                type="button"
                className={`strength-option${
                  variant.slug === selected.slug ? " is-active" : ""
                }`}
                aria-pressed={variant.slug === selected.slug}
                onClick={() => setSelected(variant)}
              >
                {variant.strength}
              </button>
            ))}
          </div>
        ) : (
          <span className="product-strength">{selected.strength}</span>
        )}
      </div>
      <div className="product-footer">
        <strong>{formatPrice(selected.priceCents)}</strong>
        <div className="product-actions">
          <Link className="card-cta" href={`/store/${selected.slug}`}>
            Details
          </Link>
          <AddToCartButton key={selected.slug} product={selected} />
        </div>
      </div>
    </article>
  );
}
