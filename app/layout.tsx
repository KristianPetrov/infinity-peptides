import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./components/CartProvider";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { getCurrentUser } from "@/lib/auth/session";

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const siteUrl = "https://infinity-peptides.com";

export const metadata: Metadata = {
  title: {
    default: "Infinity Peptides | Research Peptide Catalog",
    template: "%s | Infinity Peptides",
  },
  description:
    "Premium Research Use Only peptide catalog for qualified laboratory research teams. Clear USD pricing, polished lot presentation, and compliance-first design.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Infinity Peptides",
    description:
      "Premium Research Use Only peptide catalog for qualified laboratory research teams.",
    url: siteUrl,
    siteName: "Infinity Peptides",
    images: [
      {
        url: "/infinity-peptides-logo.png",
        width: 1536,
        height: 1024,
        alt: "Infinity Peptides logo",
      },
    ],
  },
  icons: {
    icon: "/infinity-peptides-logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${sora.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <CartProvider>
          <div className="site-shell">
            <div className="aurora" aria-hidden="true">
              <span className="aurora-blob aurora-1" />
              <span className="aurora-blob aurora-2" />
              <span className="aurora-blob aurora-3" />
              <span className="grid-veil" />
            </div>
            <Header userRole={user?.role ?? null} />
            <main className="site-main">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
