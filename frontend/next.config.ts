import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withSerwistInit from "@serwist/next";

const withNextIntl = createNextIntlPlugin(
  "./src/i18n/request.ts"
);

const withPWA = withSerwistInit({
  swSrc: "./src/sw.ts",
  swDest: "./public/sw.js",
  swUrl: "/sw.js",
  scope: "/",
  register: false,
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  // Optimisation des images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 an
  },

  // Compression automatique
  compress: true,

  // En developpement, garder davantage de routes compilees en memoire.
  // Cela evite de recompiler les pages dashboard a chaque aller-retour.
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 100,
  },

  // Ne pas rediriger entre /api/.../ et /api/... (Django APPEND_SLASH
  // provoque une boucle de redirections avec le proxy vers le backend).
  skipTrailingSlashRedirect: true,
  
  // Headers pour cache et sécurité
  
  async headers() {
    return [
      {
        source: "/fr/connexion",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
      {
        source: "/en/connexion",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
      {
        source: "/fr/inscription",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
      {
        source: "/en/inscription",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  async rewrites() {
  return [
    // Proxy vers Django
    {
      source: "/api/:path*",
      destination: "http://localhost:8000/api/:path*",
    },

    // Réécriture des routes administrateur
    {
      source: "/fr/administrateur/:path*",
      destination: "/fr/admin/:path*",
    },
    {
      source: "/fr/administrateur",
      destination: "/fr/admin",
    },
  ];
},

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,

  // Masque l'indicateur "N" de developpement (Rendering/Building).
  // Dev-only : aucune incidence en production, les erreurs restent visibles.
  devIndicators: false,
};

export default withNextIntl(withPWA(nextConfig));
