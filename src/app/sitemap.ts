import { type MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: new URL(`https://${process.env.VERCEL_URL}`).toString(),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: new URL(`https://${process.env.VERCEL_URL}/explore`).toString(),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
