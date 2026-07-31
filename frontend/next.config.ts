import path from "path";
import type { NextConfig } from "next";

// CSP is intentionally strict by default. `'unsafe-inline'` on style-src is
// needed because Tailwind + several UI primitives (Radix) inject inline
// styles; script-src has no 'unsafe-inline'/'unsafe-eval' so remote script
// injection via XSS can't execute. Tighten style-src further with nonces if
// a stricter CSP is required later.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Scope this to the actual storage/CDN domain(s) in use — replace
      // with the real bucket/CDN hostname before deploying. A wildcard
      // ("**") here lets the Next.js Image Optimizer proxy-fetch and
      // resize images from *any* remote host, which is an SSRF-adjacent
      // risk (arbitrary URL fetch on your server) as well as a cost/abuse
      // vector, not just a correctness issue.
      { protocol: "https", hostname: "*.amazonaws.com" },
      // { protocol: "https", hostname: "your-cdn-domain.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  outputFileTracingRoot: path.join(__dirname),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // HSTS only makes sense once HTTPS is enforced everywhere (it
          // tells browsers to refuse HTTP entirely for a year) — keep this
          // commented until the deployment is confirmed HTTPS-only, then
          // enable it.
          // { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
