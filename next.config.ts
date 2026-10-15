import type { NextConfig } from "next";

/** Baseline security headers (TRD v2 §10). A full CSP lands with hardening, once Clerk's origins are known. */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  typedRoutes: true,
  async redirects() {
    // The app used to live under /townhallai; keep old links working.
    return [
      { source: "/townhallai", destination: "/", permanent: true },
      { source: "/townhallai/:path*", destination: "/:path*", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
