"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { useCart } from "./CartProvider";

const NAV = [
  { href: "/store", label: "Store" },
  { href: "/science", label: "Science" },
  { href: "/compliance", label: "Compliance" },
  { href: "/track", label: "Track" },
];

// usePathname() counts as request data on routes with unknown params, so it
// lives in its own Suspense boundary to keep the header in the static shell.
function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={pathname.startsWith(item.href) ? "is-active" : ""}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

function PlainNavLinks() {
  return (
    <>
      {NAV.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </>
  );
}

type HeaderProps = {
  // Server-rendered auth link (Login / Account / Admin) streamed in via
  // Suspense so the header shell stays static.
  authSlot?: React.ReactNode;
};

export function Header({ authSlot = null }: HeaderProps) {
  const { count, hydrated, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

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
            sizes="46px"
            priority
          />
          <span>Infinity Peptides</span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          <Suspense fallback={<PlainNavLinks />}>
            <NavLinks />
          </Suspense>
          {authSlot}
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
        <nav
          className="mobile-nav"
          aria-label="Mobile navigation"
          onClick={() => setMobileOpen(false)}
        >
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          {authSlot}
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
