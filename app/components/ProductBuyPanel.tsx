"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import type { Product } from "@/lib/products";

export function ProductBuyPanel({ product }: { product: Product }) {
  const { addItem, openDrawer } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Inquiry-only products route to email.
  if (product.priceCents == null) {
    const subject = `Infinity Peptides inquiry: ${product.name} ${product.strength}`;
    return (
      <div className="pdp-buy">
        <a
          className="button-primary"
          href={`mailto:orders@infinity-peptides.com?subject=${encodeURIComponent(subject)}`}
        >
          Request pricing
        </a>
        <Link className="button-secondary" href="/store">
          Back to catalog
        </Link>
      </div>
    );
  }

  const add = (openAfter: boolean) => {
    addItem(
      {
        slug: product.slug,
        name: product.name,
        strength: product.strength,
        priceCents: product.priceCents as number,
        imageSrc: product.imageSrc,
      },
      qty,
    );
    if (openAfter) {
      openDrawer();
    } else {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1400);
    }
  };

  return (
    <div className="pdp-buy">
      <div className="qty-stepper">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span>{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button type="button" className="button-primary" onClick={() => add(false)}>
        {added ? "Added ✓" : "Add to cart"}
      </button>
      <button type="button" className="button-secondary" onClick={() => add(true)}>
        Buy now
      </button>
    </div>
  );
}
