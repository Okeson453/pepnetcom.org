"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useSmsSettings, useUpdateSmsSettings } from "@/features/settings";
export default function SMSSettingsPage() {
  const { data } = useSmsSettings();
  const { register, handleSubmit } = useForm({ defaultValues: data as any });
  const mutation = useUpdateSmsSettings();
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">SMS Settings</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-md space-y-4">
        <FormField label="Provider"><Input {...register("provider")} /></FormField>
        <FormField label="API Key"><Input {...register("apiKey")} /></FormField>
        <FormField label="Sender ID"><Input {...register("senderId")} /></FormField>
        <Button type="submit" disabled={mutation.isPending}>Save</Button>
      </form></div>);
}
