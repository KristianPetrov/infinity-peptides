"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/products";
import { ProductImage } from "./ProductImage";

export function CartDrawer() {
  const {
    items,
    subtotalCents,
    count,
    drawerOpen,
    closeDrawer,
    setQuantity,
    removeItem,
  } = useCart();

  return (
    <div
      className={`cart-drawer-root ${drawerOpen ? "is-open" : ""}`}
      aria-hidden={!drawerOpen}
    >
      <div className="cart-scrim" onClick={closeDrawer} />
      <aside
        className="cart-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="cart-head">
          <div>
            <p className="eyebrow">Your cart</p>
            <h3>{count > 0 ? `${count} item${count > 1 ? "s" : ""}` : "Empty"}</h3>
          </div>
          <button
            type="button"
            className="cart-close"
            onClick={closeDrawer}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your research cart is empty.</p>
            <Link className="button-secondary" href="/store" onClick={closeDrawer}>
              Browse catalog
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-list">
              {items.map((item) => (
                <li className="cart-line" key={item.slug}>
                  <span className={`cart-thumb ${item.imageSrc ? "has-product-image" : ""}`}>
                    <ProductImage
                      imageSrc={item.imageSrc}
                      name={item.name}
                      strength={item.strength}
                      sizes="54px"
                    />
                  </span>
                  <div className="cart-line-body">
                    <strong>{item.name}</strong>
                    <span className="cart-line-strength">{item.strength}</span>
                    <div className="qty-row">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.slug, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.slug, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="cart-remove"
                        onClick={() => removeItem(item.slug)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className="cart-line-price">
                    {formatPrice(item.priceCents * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="cart-foot">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotalCents)}</strong>
              </div>
              <p className="cart-note">
                Shipping and manual payment instructions are confirmed at
                checkout. For Research Use Only.
              </p>
              <Link className="button-primary cart-checkout" href="/checkout" onClick={closeDrawer}>
                Proceed to checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
