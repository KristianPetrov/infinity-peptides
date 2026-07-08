import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/store`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/science`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/compliance`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/track`, lastModified, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/store/${product.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
