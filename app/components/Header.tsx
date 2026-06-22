"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";

const NAV = [
  { href: "/store", label: "Store" },
  { href: "/science", label: "Science" },
  { href: "/compliance", label: "Compliance" },
  { href: "/track", label: "Track" },
];

type HeaderProps = {
  userRole?: "customer" | "admin" | null;
};

export function Header({ userRole = null }: HeaderProps) {
  const { count, hydrated, openDrawer } = useCart();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [
    ...NAV,
    userRole === "admin"
      ? { href: "/admin", label: "Admin" }
      : userRole === "customer"
        ? { href: "/account", label: "Account" }
        : { href: "/login", label: "Login" },
  ];

  return (
    <>
      <div className="ruo-strip">
        <span>For Research Use Only</span>
        <span>Not for human or veterinary use</span>
        <span>Qualified laboratory research only</span>
      </div>

      <header className="site-header">
        <Link className="brand-lockup" href="/" aria-label="Infinity Peptides home">
          <Image
            src="/infinity-peptides-logo.png"
            alt="Infinity Peptides"
            width={1536}
            height={1024}
            priority
          />
          <span>Infinity Peptides</span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname.startsWith(item.href) ? "is-active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-tools">
          <button
            type="button"
            className="cart-button"
            onClick={openDrawer}
            aria-label="Open cart"
          >
            <CartIcon />
            <span className="cart-text">Cart</span>
            {hydrated && count > 0 ? (
              <span className="cart-badge">{count}</span>
            ) : null}
          </button>
          <button
            type="button"
            className="menu-button"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </>
  );
}

function CartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
