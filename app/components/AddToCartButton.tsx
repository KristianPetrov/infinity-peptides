"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import type { Product } from "@/lib/products";

type Props = {
  product: Product;
  quantity?: number;
  variant?: "card" | "detail";
  label?: string;
};

export function AddToCartButton({
  product,
  quantity = 1,
  variant = "card",
  label,
}: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  // Inquiry-only products (no price) route to email instead of the cart.
  if (product.priceCents == null) {
    const subject = `Infinity Peptides inquiry: ${product.name} ${product.strength}`;
    return (
      <a
        className={variant === "detail" ? "button-secondary" : "card-cta"}
        href={`mailto:orders@infinity-peptides.com?subject=${encodeURIComponent(subject)}`}
      >
        Inquire
      </a>
    );
  }

  const onClick = () => {
    addItem(
      {
        slug: product.slug,
        name: product.name,
        strength: product.strength,
        priceCents: product.priceCents as number,
      },
      quantity,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <button
      type="button"
      className={variant === "detail" ? "button-primary" : "card-cta card-cta-buy"}
      onClick={onClick}
      aria-label={`Add ${product.name} ${product.strength} to cart`}
    >
      {added ? "Added ✓" : label ?? (variant === "detail" ? "Add to cart" : "Add")}
    </button>
  );
}
