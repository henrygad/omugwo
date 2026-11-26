import type { MetadataRoute } from "next";

const productionUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://omugwoseries.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    { path: "", priority: 1, frequency: "weekly" as const },
    { path: "/submit-review", priority: 0.5, frequency: "monthly" as const },
    { path: "/affiliate", priority: 0.6, frequency: "monthly" as const },
    { path: "/policies/terms", priority: 0.3, frequency: "yearly" as const },
    { path: "/policies/refunds", priority: 0.3, frequency: "yearly" as const },
    { path: "/policies/delivery", priority: 0.3, frequency: "monthly" as const },
    { path: "/policies/privacy", priority: 0.3, frequency: "yearly" as const },
    { path: "/policies/affiliate", priority: 0.3, frequency: "yearly" as const },
  ];

  return paths.map(({ path, priority, frequency }) => ({
    url: `${productionUrl}${path}`,
    changeFrequency: frequency,
    priority,
  }));
}

