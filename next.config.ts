import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components / Partial Prerendering: static shell served instantly,
  // dynamic (cookie/db-backed) subtrees stream in behind Suspense boundaries.
  cacheComponents: true,
};

export default nextConfig;
