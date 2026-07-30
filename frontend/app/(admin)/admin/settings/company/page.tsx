"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import { useCompanySettings, useUpdateCompanySettings } from "@/features/settings";
export default function CompanySettingsPage() {
  const { data } = useCompanySettings();
  const { register, handleSubmit } = useForm({ defaultValues: data as any });
  const mutation = useUpdateCompanySettings();
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Company Information</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-md space-y-4">
        <FormField label="Company Name"><Input {...register("companyName")} /></FormField>
        <FormField label="Address"><Textarea {...register("address")} /></FormField>
        <FormField label="Phone"><Input {...register("phone")} /></FormField>
        <Button type="submit" disabled={mutation.isPending}>Save</Button>
      </form></div>);
}
