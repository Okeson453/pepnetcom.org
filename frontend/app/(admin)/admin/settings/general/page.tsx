"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useGeneralSettings, useUpdateGeneralSettings } from "@/features/settings";
export default function GeneralSettingsPage() {
  const { data } = useGeneralSettings();
  const { register, handleSubmit } = useForm({ defaultValues: data as any });
  const mutation = useUpdateGeneralSettings();
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">General Settings</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-md space-y-4">
        <FormField label="Site Name"><Input {...register("siteName")} /></FormField>
        <FormField label="Support Email"><Input {...register("supportEmail")} /></FormField>
        <Button type="submit" disabled={mutation.isPending}>Save</Button>
      </form></div>);
}
