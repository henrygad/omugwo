import type { MetadataRoute } from "next";

const productionUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://omugwoseries.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/checkout", "/order/confirm"],
    },
    sitemap: `${productionUrl}/sitemap.xml`,
    host: productionUrl,
  };
}

