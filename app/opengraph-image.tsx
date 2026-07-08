import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { BRAND, OG_SIZE, SITE_NAME } from "@/lib/seo";

export const alt = `${SITE_NAME} — Research Use Only peptide catalog`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(
    path.join(process.cwd(), "public", "infinity-peptides-logo.png"),
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(circle at 20% 15%, rgba(244, 80, 185, 0.28), transparent 45%), radial-gradient(circle at 80% 20%, rgba(78, 231, 242, 0.24), transparent 45%), radial-gradient(circle at 55% 90%, rgba(139, 101, 255, 0.3), transparent 50%), ${BRAND.background}`,
          color: BRAND.foreground,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" width={620} height={413} />
        <div
          style={{
            display: "flex",
            fontSize: 30,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: BRAND.muted,
            marginTop: 8,
          }}
        >
          Research Peptide Catalog
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 36,
            display: "flex",
            fontSize: 22,
            letterSpacing: 4,
            color: BRAND.muted,
          }}
        >
          infinity-peptides.com · For Research Use Only
        </div>
      </div>
    ),
    { ...size },
  );
}
