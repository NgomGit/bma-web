import type { NextConfig } from "next";

/**
 * Hôte du projet Supabase, d'où sont servies les photos des véhicules.
 * Déclaré ici pour le jour où l'optimisation d'images sera réactivée : sans
 * cette autorisation, `next/image` refuse toute source distante.
 */
const supabaseHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).host : null;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Les photos sont servies telles quelles, sans passer par /_next/image.
   *
   * Pourquoi : sur Vercel, l'optimiseur est facturé à la transformation et le
   * plan Hobby s'arrête à 5 000 par mois. Au-delà il renvoie un 402 et le
   * navigateur affiche le texte alternatif à la place de la voiture — c'est
   * exactement ce qui est arrivé.
   *
   * Ce que ça coûte : plus de conversion automatique en AVIF/WebP ni de
   * redimensionnement par point de rupture. Ce que ça ne coûte pas grand-chose
   * ici : chaque photo est déjà redimensionnée (1280 px pour les couvertures,
   * 1400 px pour la galerie) et recompressée en amont. L'optimiseur n'avait
   * plus grand-chose à gagner, et le site ne dépend plus d'un service facturé
   * au compteur, quel que soit l'hébergeur.
   */
  images: {
    unoptimized: true,
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
