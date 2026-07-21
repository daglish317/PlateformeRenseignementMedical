import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin(
  "./src/i18n/request.ts"
);

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  async rewrites() {
    return [
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
};

export default withPWA(withNextIntl(nextConfig));