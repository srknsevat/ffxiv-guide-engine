import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: `${site}/sitemap.xml`,
    host: site.replace(/^https?:\/\//, "")
  };
}
