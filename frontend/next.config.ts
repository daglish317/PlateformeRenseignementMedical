import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  "./src/i18n/request.ts"
);

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

export default withNextIntl(nextConfig);