"use client";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthCardShell } from "@/components/layout/auth-card-shell";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/forms/form-field";
import { PasswordRequirements } from "@/components/forms/password-requirements";
import { useResetPassword } from "@/features/auth";

// min(8) matches the backend's real resetPasswordSchema exactly (it was
// min(6) here previously, which would let a user submit a password the
// backend then rejects with its own validation error).
const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

// See app/(auth)/login/page.tsx for why useSearchParams() needs its own
// Suspense boundary to avoid failing static prerendering at build time.
function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const password = watch("password", "");
  const mutation = useResetPassword();

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate({ password: d.password, token }))} className="space-y-4">
      <FormField label="New Password" required error={errors.password?.message}>
        <PasswordInput {...register("password")} />
      </FormField>
      <PasswordRequirements password={password} />
      <FormField label="Confirm New Password" required error={errors.confirmPassword?.message}>
        <PasswordInput {...register("confirmPassword")} />
      </FormField>
      {mutation.isError && <p className="text-sm text-rust">Something went wrong. The link may have expired.</p>}
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Updating...
          </span>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCardShell title="New password" subtitle="Set a new password for your account">
      <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-graphite/5" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCardShell>
  );
}
