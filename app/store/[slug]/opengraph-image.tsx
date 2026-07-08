import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { formatPrice, getProductBySlug, products } from "@/lib/products";
import { BRAND, OG_SIZE, SITE_NAME } from "@/lib/seo";

export const alt = `Product spotlight — ${SITE_NAME}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

async function publicImageAsDataUri(publicPath: string) {
  try {
    const buffer = await readFile(path.join(process.cwd(), "public", publicPath));
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function ProductOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  const productImage = product?.imageSrc
    ? await publicImageAsDataUri(product.imageSrc)
    : null;
  const logo = await publicImageAsDataUri("infinity-peptides-logo.png");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "56px 64px",
          background: `radial-gradient(circle at 15% 20%, rgba(244, 80, 185, 0.25), transparent 45%), radial-gradient(circle at 85% 80%, rgba(78, 231, 242, 0.22), transparent 45%), radial-gradient(circle at 70% 10%, rgba(139, 101, 255, 0.28), transparent 50%), ${BRAND.background}`,
          color: BRAND.foreground,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            paddingRight: 48,
          }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" width={210} height={140} style={{ marginLeft: -24 }} />
          ) : null}
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: BRAND.cyan,
              marginBottom: 14,
            }}
          >
            {product?.category ?? "Research Catalog"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.05,
              marginBottom: 12,
            }}
          >
            {product ? product.name : SITE_NAME}
          </div>
          {product ? (
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 20,
                fontSize: 34,
                color: BRAND.muted,
              }}
            >
              <span>{product.strength}</span>
              {product.priceCents ? (
                <span style={{ color: BRAND.foreground, fontWeight: 700 }}>
                  {formatPrice(product.priceCents)}
                </span>
              ) : null}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              marginTop: 34,
              fontSize: 21,
              letterSpacing: 3,
              color: BRAND.muted,
            }}
          >
            infinity-peptides.com · For Research Use Only
          </div>
        </div>

        {productImage ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 440,
              height: 518,
              borderRadius: 28,
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={productImage} alt="" width={400} height={400} />
          </div>
        ) : null}
      </div>
    ),
    { ...size },
  );
}
