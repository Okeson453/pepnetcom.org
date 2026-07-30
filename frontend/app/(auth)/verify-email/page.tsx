"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useVerifyEmail } from "@/features/auth";
import { AuthCardShell } from "@/components/layout/auth-card-shell";
import { Button } from "@/components/ui/button";

// See app/(auth)/login/page.tsx for why useSearchParams() needs its own
// Suspense boundary to avoid failing static prerendering at build time.
function VerifyEmailStatus() {
  const token = useSearchParams().get("token") ?? "";
  const mutation = useVerifyEmail();
  useEffect(() => { if (token) mutation.mutate({ token }); }, [token]);

  return (
    <AuthCardShell
      title="Verify email"
      subtitle={mutation.isPending ? "Verifying..." : mutation.isSuccess ? "Email verified!" : "Verifying your email address"}
    >
      <div className="text-center space-y-4">
        {mutation.isPending && <Loader2 className="h-6 w-6 animate-spin mx-auto text-graphite/40" />}
        {mutation.isSuccess && (
          <>
            <CheckCircle2 className="h-8 w-8 mx-auto text-teal" />
            <Button asChild className="w-full"><Link href="/login">Continue to login</Link></Button>
          </>
        )}
        {mutation.isError && (
          <>
            <XCircle className="h-8 w-8 mx-auto text-rust" />
            <p className="text-sm text-rust">This verification link is invalid or has expired.</p>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/resend-verification">Request a new link</Link>
            </Button>
          </>
        )}
      </div>
    </AuthCardShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthCardShell title="Verify email" subtitle="Loading..."><div /></AuthCardShell>}>
      <VerifyEmailStatus />
    </Suspense>
  );
}
