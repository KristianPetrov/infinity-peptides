import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Catalog",
    links: [
      { href: "/store", label: "All products" },
      { href: "/store#metabolic-research", label: "Metabolic" },
      { href: "/store#repair-matrix", label: "Repair & Matrix" },
      { href: "/store#longevity-cellular", label: "Longevity" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/science", label: "Science & quality" },
      { href: "/track", label: "Track an order" },
      { href: "/checkout", label: "Checkout" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/compliance", label: "Research Use Only" },
      { href: "/terms", label: "Terms of sale" },
      { href: "/privacy", label: "Privacy policy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Image
            src="/infinity-peptides-logo.png"
            alt="Infinity Peptides"
            width={1536}
            height={1024}
          />
          <p>
            A premium Research Use Only peptide catalog built for qualified
            laboratory research teams. Clear pricing, polished lot presentation,
            and compliance-first design.
          </p>
        </div>

        {FOOTER_LINKS.map((column) => (
          <nav className="footer-col" key={column.heading} aria-label={column.heading}>
            <h4>{column.heading}</h4>
            {column.links.map((link) => (
              <Link key={link.href + link.label} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>

      <div className="footer-ruo">
        <strong>For Research Use Only.</strong> Not for human or veterinary use.
        Products are intended strictly for in-vitro laboratory research and
        development. By using this site you acknowledge that you are a qualified
        researcher.
      </div>

      <div className="footer-base">
        <span>© {new Date().getFullYear()} Infinity Peptides</span>
        <span>infinity-peptides.com</span>
      </div>
    </footer>
  );
}
