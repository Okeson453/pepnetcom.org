import { secureHeaders } from 'hono/secure-headers'

// §4.1 of the audit: the middleware stack previously never set HSTS,
// X-Content-Type-Options, X-Frame-Options/CSP, Referrer-Policy, or
// Permissions-Policy. Even for a JSON/tRPC API this matters — it protects
// against protocol downgrade, MIME-sniffing, and framing/embedding of any
// endpoint that returns user-influenced content (including error bodies and
// payment-redirect pages).
export const securityHeadersMiddleware = secureHeaders({
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'no-referrer',
  contentSecurityPolicy: {
    defaultSrc: ["'none'"],
    frameAncestors: ["'none'"],
  },
  permissionsPolicy: {
    geolocation: [],
    camera: [],
    microphone: [],
  },
})
