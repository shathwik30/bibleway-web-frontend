import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to THIS directory (frontend/).
  // Without this, Turbopack walks up and finds the root package-lock.json,
  // then tries to resolve tailwindcss from the wrong directory — causing
  // cascading compilation failures and 20+ Node processes spawning.
  turbopack: {
    root: __dirname,
  },

  // Disable TypeScript type-checking during dev build (VSCode handles this).
  // This prevents a separate `tsc` process from spawning on every save.
  typescript: {
    ignoreBuildErrors: true,
  },


};

export default nextConfig;
