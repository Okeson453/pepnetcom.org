"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { AuthCardShell } from "@/components/layout/auth-card-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/forms/form-field";
import { PasswordRequirements } from "@/components/forms/password-requirements";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { useRegister } from "@/features/auth";

// Matches the real backend's registerSchema exactly (firstName/lastName,
// not a single `name` field; password min 8, not 6 — see
// pepnetcom-backend/src/modules/auth/auth.schema.ts). confirmPassword and
// termsAccepted are frontend-only fields (validated here, not sent to the
// backend) covering password-confirmation and consent-to-terms.
const schema = z
  .object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    email: z.string().email(),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: "You must accept the Terms and Privacy Policy to continue" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const password = watch("password", "");

  const mutation = useRegister({
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => router.push("/login"), 1800);
    },
  });

  const onSubmit = (d: FormData) => {
    mutation.mutate({
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      password: d.password,
    });
  };

  return (
    <AuthCardShell title="Create account" subtitle="Join the PEPNETCOM network">
      {showSuccess && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-teal/10 px-3 py-2.5 text-sm text-teal">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Account created! Taking you to sign in...
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First Name" required error={errors.firstName?.message}>
            <Input {...register("firstName")} />
          </FormField>
          <FormField label="Last Name" required error={errors.lastName?.message}>
            <Input {...register("lastName")} />
          </FormField>
        </div>
        <FormField label="Email" required error={errors.email?.message}>
          <Input type="email" {...register("email")} />
        </FormField>
        <FormField label="Password" required error={errors.password?.message}>
          <PasswordInput {...register("password")} />
        </FormField>
        <PasswordRequirements password={password} />
        <FormField label="Confirm Password" required error={errors.confirmPassword?.message}>
          <PasswordInput {...register("confirmPassword")} />
        </FormField>
        <div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5" {...register("termsAccepted")} />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-amber hover:underline" target="_blank">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-amber hover:underline" target="_blank">Privacy Policy</Link>.
              <span className="text-rust ml-0.5">*</span>
            </span>
          </label>
          {errors.termsAccepted && <p className="mt-1 text-xs text-rust">{errors.termsAccepted.message}</p>}
        </div>
        {mutation.isError && (
          <p className="text-sm text-rust">
            {mutation.error instanceof Error ? mutation.error.message : "Something went wrong. Please try again."}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-graphite/10" /></div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-bone px-3 text-graphite/40">or</span>
        </div>
      </div>
      <GoogleSignInButton callbackUrl="/dashboard" />

      <p className="text-center text-sm mt-6 opacity-70">
        Already have an account?{" "}
        <Link href="/login" className="text-amber hover:underline font-medium">Log in</Link>
      </p>
    </AuthCardShell>
  );
}
