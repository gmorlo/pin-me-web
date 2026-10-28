import type { NextConfig } from "next";

const apiOrigin = process.env.API_ORIGIN ?? "http://localhost:8000";

if (process.env.VERCEL && !process.env.API_ORIGIN) {
  throw new Error("API_ORIGIN must be set on Vercel (e.g. https://<api>.up.railway.app)");
}

const nextConfig: NextConfig = {
  // Same-origin proxy: the auth cookie stays first-party (vercel.app and railway.app are separate sites).
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiOrigin.replace(/\/$/, "")}/:path*` },
    ];
  },
};

export default nextConfig;
