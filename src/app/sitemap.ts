import type { MetadataRoute } from "next";
import { getVehicles } from "@/lib/store";
import { bodiesOf, brandsOf } from "@/data/vehicles";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getVehicles();
  const now = new Date();

  return [
    { url: site.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/vehicules`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${site.url}/import-voiture-dakar`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...bodiesOf(vehicles).map((b) => ({
      url: `${site.url}/vehicules/categorie/${b.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...brandsOf(vehicles).map((b) => ({
      url: `${site.url}/vehicules/marque/${b.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...vehicles.map((v) => ({
      url: `${site.url}/vehicules/${v.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
