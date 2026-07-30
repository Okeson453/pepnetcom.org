"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useSecuritySettings, useUpdateSecuritySettings } from "@/features/settings";

interface SecurityForm {
  sessionTimeout: number;
}

// This toggle is org-wide *enforcement* (require every user to have 2FA
// enabled) — that's still not implemented. Per-user 2FA itself now is: see
// TwoFactorSettingsCard on the profile page, backed by real TOTP secret
// generation, QR/otpauth provisioning, and login-time verification
// (backend/src/modules/auth/{auth.service,uploads... }.ts — search
// "twoFactor"). What's missing here specifically is a backend check that
// actually blocks login for users who haven't turned personal 2FA on when
// this flag is set; toggling it currently still changes no real behavior.
export default function SecuritySettingsPage() {
  const { data } = useSecuritySettings();
  const { register, handleSubmit, reset } = useForm<SecurityForm>();
  const mutation = useUpdateSecuritySettings();

  useEffect(() => {
    if (data) reset({ sessionTimeout: (data as any).sessionTimeout });
  }, [data, reset]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Security</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate({ ...d, twoFactorEnabled: false }))} className="max-w-md space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm opacity-50">
            <input type="checkbox" disabled className="cursor-not-allowed" />
            Require two-factor authentication for all users
          </label>
          <p className="mt-1 text-xs opacity-40">
            Org-wide enforcement isn&apos;t implemented yet. Individual admins, writers, and
            clients can already enable 2FA for their own account from their profile settings.
          </p>
        </div>
        <FormField label="Session Timeout (minutes)">
          <Input type="number" min={1} {...register("sessionTimeout", { valueAsNumber: true })} />
        </FormField>
        <Button type="submit" disabled={mutation.isPending}>Save</Button>
      </form>
    </div>
  );
}
