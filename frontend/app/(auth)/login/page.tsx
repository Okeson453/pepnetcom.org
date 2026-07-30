"use client";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthCardShell } from "@/components/layout/auth-card-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/forms/form-field";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { useAuth } from "@/features/auth";

// Login has no length requirement client-side beyond "non-empty" — the
// backend's loginSchema doesn't enforce a minimum either (unlike
// registration), since a pre-existing account could have been created
// under an older/different password policy. Enforcing today's policy here
// would lock out anyone whose password predates it.
const schema = z.object({ email: z.string().email(), password: z.string().min(1, "Required") });
type FormData = z.infer<typeof schema>;

// useSearchParams() opts a page out of static prerendering unless wrapped in
// its own Suspense boundary — Next.js needs a fallback to show while it
// resolves the search params on the client. Split into an outer page (safe
// to prerender) and an inner form component (the actual useSearchParams
// consumer) so the build doesn't fail on "/login".
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Set once the backend tells us this account has 2FA enabled — switches
  // the form to a code-entry step instead of resubmitting email/password.
  const [pendingCredentials, setPendingCredentials] = useState<FormData | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setFormError(null);
    // Goes through next-auth's Credentials provider (lib/auth.ts) so a real
    // session cookie is set — middleware.ts checks that session, not a
    // standalone tRPC call, so a mock "success" here without this would
    // just bounce the user straight back to /login.
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    setIsSubmitting(false);
    if (result?.error) {
      if (result.code === "mfa_required") {
        setPendingCredentials(data);
        return;
      }
      setFormError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
  };

  const onSubmitTwoFactor = async () => {
    if (!pendingCredentials) return;
    setIsSubmitting(true);
    setFormError(null);
    const result = await signIn("credentials", {
      ...pendingCredentials,
      totpCode,
      redirect: false,
    });
    setIsSubmitting(false);
    if (result?.error) {
      setFormError(
        result.code === "invalid_2fa_code"
          ? "That code didn't work — check your authenticator app and try again, or use a backup code."
          : "Something went wrong. Please try again."
      );
      return;
    }
    router.push(callbackUrl);
  };

  if (pendingCredentials) {
    return (
      <div className="space-y-4">
        <p className="text-sm opacity-70">
          Enter the 6-digit code from your authenticator app, or one of your backup codes.
        </p>
        <FormField label="Two-factor code" required>
          <Input
            autoFocus
            inputMode="text"
            placeholder="123456 or 7F3K-9QRT"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
          />
        </FormField>
        {formError && <p className="text-sm text-rust">{formError}</p>}
        <Button className="w-full" disabled={isSubmitting || !totpCode} onClick={onSubmitTwoFactor}>
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
            </span>
          ) : (
            "Verify"
          )}
        </Button>
        <button
          type="button"
          className="text-xs text-amber hover:underline"
          onClick={() => { setPendingCredentials(null); setTotpCode(""); setFormError(null); }}
        >
          ← Back to sign in
        </button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" required error={errors.email?.message}>
          <Input type="email" {...register("email")} />
        </FormField>
        <div>
          <FormField label="Password" required error={errors.password?.message}>
            <PasswordInput {...register("password")} />
          </FormField>
          <div className="text-right mt-1.5">
            <Link href="/forgot-password" className="text-xs text-amber hover:underline">Forgot password?</Link>
          </div>
        </div>
        {formError && <p className="text-sm text-rust">{formError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-graphite/10" /></div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-bone px-3 text-graphite/40">or</span>
        </div>
      </div>
      <GoogleSignInButton callbackUrl={callbackUrl} onError={setFormError} />

      <p className="text-center text-sm mt-6 opacity-70">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-amber hover:underline font-medium">Sign up</Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthCardShell title="Welcome back" subtitle="Sign in to your PEPNETCOM account">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-graphite/5" />}>
        <LoginForm />
      </Suspense>
    </AuthCardShell>
  );
}
