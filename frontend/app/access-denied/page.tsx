"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/components/ui/button";

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: "/admin",
  WRITER: "/writer",
  CLIENT: "/dashboard",
};

// Previously, visiting a zone your role doesn't belong to (e.g. a CLIENT
// hitting /admin/*) silently redirected to your own dashboard with zero
// explanation — confusing if you didn't understand why the URL you typed
// or clicked didn't take you where you expected. This page names what
// happened and gives a clear way forward.
function AccessDeniedContent() {
  const { role } = useAuth();
  const path = useSearchParams().get("path");
  const home = role ? HOME_BY_ROLE[role] ?? "/" : "/";

  return (
    <div className="min-h-screen bg-bone flex flex-col items-center justify-center px-6 text-center">
      <ShieldAlert className="h-12 w-12 text-rust mb-4" />
      <h1 className="font-display text-2xl font-bold mb-2">Access denied</h1>
      <p className="text-sm opacity-70 max-w-sm mb-1">
        {path ? <>You don&apos;t have permission to view <span className="font-mono">{path}</span>.</> : "You don't have permission to view that page."}
      </p>
      <p className="text-sm opacity-70 max-w-sm mb-6">
        {role ? "This area isn't part of your account's role." : "Sign in with an account that has access."}
      </p>
      <Button asChild><Link href={home}>{role ? "Go to your dashboard" : "Go to login"}</Link></Button>
    </div>
  );
}

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bone" />}>
      <AccessDeniedContent />
    </Suspense>
  );
}
