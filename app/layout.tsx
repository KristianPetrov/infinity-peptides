import type { Metadata, Viewport } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "./components/CartProvider";
import { Header } from "./components/Header";
import { HeaderAuthLink } from "./components/HeaderAuthLink";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { BRAND, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/seo";

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "science",
  keywords: [
    "research peptides",
    "research use only peptides",
    "peptide catalog",
    "laboratory reference compounds",
    "HPLC verified peptides",
    "lyophilized peptides",
    "infinity peptides",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false, address: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: BRAND.background,
  colorScheme: "dark",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/infinity-peptides-logo.png`,
  description: SITE_DESCRIPTION,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
          }}
        />
        <CartProvider>
          <div className="site-shell">
            <div className="aurora" aria-hidden="true">
              <span className="aurora-blob aurora-1" />
              <span className="aurora-blob aurora-2" />
              <span className="aurora-blob aurora-3" />
              <span className="grid-veil" />
            </div>
            <Header
              authSlot={
                <Suspense fallback={<Link href="/login">Login</Link>}>
                  <HeaderAuthLink />
                </Suspense>
              }
            />
            <main className="site-main">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
