import type { NextConfig } from "next";

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
  images: { unoptimized: true },
};

export default nextConfig;
