"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/forms/form-field";
import { PasswordRequirements } from "@/components/forms/password-requirements";
import { useChangePassword } from "@/features/auth";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

/** Shared across client/writer/admin profile pages — was previously a dead button on every one of them (no backend procedure existed at all). */
export function ChangePasswordCard() {
  const [showSuccess, setShowSuccess] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const newPassword = watch("newPassword", "");

  const mutation = useChangePassword({
    onSuccess: () => {
      reset();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    },
  });

  return (
    <Card>
      <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
      <CardContent>
        {showSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-teal/10 px-3 py-2.5 text-sm text-teal">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Password updated. Your other sessions have been signed out.
          </div>
        )}
        <form onSubmit={handleSubmit((d) => mutation.mutate({ currentPassword: d.currentPassword, newPassword: d.newPassword }))} className="space-y-4 max-w-sm">
          <FormField label="Current Password" required error={errors.currentPassword?.message}>
            <PasswordInput {...register("currentPassword")} />
          </FormField>
          <FormField label="New Password" required error={errors.newPassword?.message}>
            <PasswordInput {...register("newPassword")} />
          </FormField>
          <PasswordRequirements password={newPassword} />
          <FormField label="Confirm New Password" required error={errors.confirmPassword?.message}>
            <PasswordInput {...register("confirmPassword")} />
          </FormField>
          {mutation.isError && (
            <p className="text-sm text-rust">
              {mutation.error?.message === "Current password is incorrect"
                ? "Current password is incorrect."
                : "Something went wrong. Please try again."}
            </p>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Updating...</span>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
