import type { MetadataRoute } from "next";
import { siteUrl } from "@/shared/config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: "2026-10-11",
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/chat/`,
      lastModified: "2026-10-11",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/policy/`,
      lastModified: "2026-10-15",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms/`,
      lastModified: "2026-10-15",
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
