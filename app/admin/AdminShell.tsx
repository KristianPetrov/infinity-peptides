import Link from "next/link";
import { logoutAdmin } from "./actions";

const tabs = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="admin-shell">
      <div className="admin-head">
        <div>
          <p className="eyebrow">Infinity admin</p>
          <h1>Operations dashboard</h1>
        </div>
        <form action={logoutAdmin}>
          <button type="submit" className="button-secondary">
            Sign out
          </button>
        </form>
      </div>
      <nav className="catalog-rail" aria-label="Admin navigation">
        {tabs.map((tab) => (
          <Link href={tab.href} key={tab.href}>
            <span>{tab.label}</span>
          </Link>
        ))}
        <Link href="/">
          <span>Back to site</span>
        </Link>
      </nav>
      {children}
    </section>
  );
}
