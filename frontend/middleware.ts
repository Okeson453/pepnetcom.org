import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const ZONE_ROLE: Record<string, "CLIENT" | "ADMIN" | "WRITER"> = {
  "/dashboard": "CLIENT",
  "/admin": "ADMIN",
  "/writer": "WRITER",
};

function zoneFor(pathname: string) {
  return Object.keys(ZONE_ROLE).find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Maintenance mode — set NEXT_PUBLIC_MAINTENANCE_MODE=true (e.g. via
  // Vercel's env var UI during a deploy) to take the whole site down to
  // this one static page. Checked before anything else, and exempts
  // /maintenance itself (else this would redirect-loop) and NextAuth's own
  // routes (so an already-signed-in admin can still load a session/sign
  // out while the flag is on).
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" && pathname !== "/maintenance" && !pathname.startsWith("/api/auth")) {
    return NextResponse.redirect(new URL("/maintenance", req.url));
  }

  const zone = zoneFor(pathname);
  if (!zone) return NextResponse.next();

  const session = req.auth;

  if (!session?.user || session.error === "RefreshAccessTokenError") {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiredRole = ZONE_ROLE[zone];
  if (session.user.role !== requiredRole) {
    const deniedUrl = new URL("/access-denied", req.url);
    deniedUrl.searchParams.set("path", pathname);
    return NextResponse.redirect(deniedUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/writer/:path*",
    /*
     * Everything else too, for maintenance-mode gating — excluding Next's
     * internals, static assets, and common file extensions so those aren't
     * needlessly routed through the middleware.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
