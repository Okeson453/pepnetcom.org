"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useEmailSettings, useUpdateEmailSettings } from "@/features/settings";
export default function EmailSettingsPage() {
  const { data } = useEmailSettings();
  const { register, handleSubmit } = useForm({ defaultValues: data as any });
  const mutation = useUpdateEmailSettings();
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Email Settings</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-md space-y-4">
        <FormField label="SMTP Host"><Input {...register("smtpHost")} /></FormField>
        <FormField label="SMTP Port"><Input {...register("smtpPort")} /></FormField>
        <FormField label="From Address"><Input {...register("fromAddress")} /></FormField>
        <Button type="submit" disabled={mutation.isPending}>Save</Button>
      </form></div>);
}
