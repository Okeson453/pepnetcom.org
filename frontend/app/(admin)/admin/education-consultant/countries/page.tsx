"use client";
import { useForm } from "react-hook-form";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useCountries, useCreateCountry } from "@/features/education-consultant";

// Matches the real backend's countryCreateSchema — `code` (2-3 letter ISO
// code) is required alongside name (see consultant.schema.ts).
export default function CountryManagementPage() {
  const { data, isLoading } = useCountries();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string; code: string }>();
  const mutation = useCreateCountry({ onSuccess: () => reset() });
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Country Management</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-md flex gap-3 items-start">
        <FormField label="Name" required error={errors.name?.message} className="flex-1">
          <Input {...register("name", { required: "Required" })} placeholder="Country name" />
        </FormField>
        <FormField label="Code" required error={errors.code?.message}>
          <Input {...register("code", { required: "Required", minLength: 2, maxLength: 3 })} placeholder="NG" className="w-20" />
        </FormField>
        <Button type="submit" disabled={mutation.isPending} className="mt-6">Add</Button>
      </form>
      <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(c: any) => c.id} emptyTitle="No countries" caption="Countries"
        columns={[
          { key: "name", header: "Country", cell: (c: any) => c.name },
          { key: "code", header: "Code", cell: (c: any) => <span className="font-mono text-xs">{c.code}</span> },
        ]} />
    </div>
  );
}
