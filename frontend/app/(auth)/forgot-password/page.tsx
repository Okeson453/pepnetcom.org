"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthCardShell } from "@/components/layout/auth-card-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useForgotPassword } from "@/features/auth";

const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const mutation = useForgotPassword();
  return (
    <AuthCardShell title="Reset password" subtitle="We'll send you a reset link">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <FormField label="Email" error={errors.email?.message}><Input type="email" {...register("email")} /></FormField>
        <Button type="submit" className="w-full" disabled={mutation.isPending}>{mutation.isPending ? "Sending..." : "Send reset link"}</Button>
      </form>
    </AuthCardShell>);
}
