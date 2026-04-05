import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to THIS directory (frontend/).
  // Without this, Turbopack walks up and finds the root package-lock.json,
  // then tries to resolve tailwindcss from the wrong directory — causing
  // cascading compilation failures and 20+ Node processes spawning.
  turbopack: {
    root: __dirname,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  poweredByHeader: false,
  compress: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
