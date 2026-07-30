"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AuthCardShell } from "@/components/layout/auth-card-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useResendVerification } from "@/features/auth";

// Previously had no page or way to reach this flow at all — a user whose
// verification link expired had no path forward except contacting support.
const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

export default function ResendVerificationPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const mutation = useResendVerification();

  return (
    <AuthCardShell title="Resend verification" subtitle="We'll send a new verification link to your email">
      {mutation.isSuccess ? (
        <div className="text-center space-y-3">
          <CheckCircle2 className="h-8 w-8 mx-auto text-teal" />
          <p className="text-sm opacity-70">
            If an account exists with that email, a new verification link is on its way.
          </p>
          <Link href="/login" className="text-sm text-amber hover:underline">Back to login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <FormField label="Email" required error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </FormField>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Sending...</span>
            ) : (
              "Send new link"
            )}
          </Button>
          <p className="text-center text-sm opacity-70">
            <Link href="/login" className="text-amber hover:underline">Back to login</Link>
          </p>
        </form>
      )}
    </AuthCardShell>
  );
}
