"use client";
import { useForm } from "react-hook-form";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useUniversities, useCreateUniversity, useCountries } from "@/features/education-consultant";

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Matches the real backend's universityCreateSchema — `slug` (auto-derived
// from name) and `countryId` (a real Country reference) are both required
// alongside name (see consultant.schema.ts).
interface UniversityForm {
  name: string;
  countryId: string;
}

export default function UniversityManagementPage() {
  const { data, isLoading } = useUniversities();
  const { data: countries } = useCountries();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UniversityForm>();
  const mutation = useCreateUniversity({ onSuccess: () => reset() });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">University Management</h1>
      <form
        onSubmit={handleSubmit((d) => mutation.mutate({ name: d.name, slug: slugify(d.name), countryId: d.countryId }))}
        className="max-w-lg flex gap-3 items-start"
      >
        <FormField label="Name" required error={errors.name?.message} className="flex-1">
          <Input {...register("name", { required: "Required" })} placeholder="University name" />
        </FormField>
        <FormField label="Country" required error={errors.countryId?.message}>
          <select {...register("countryId", { required: "Required" })} className="flex rounded-md border border-graphite/15 bg-transparent px-3 py-2 text-sm h-[38px]">
            <option value="">Select...</option>
            {countries?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>
        <Button type="submit" disabled={mutation.isPending} className="mt-6">Add</Button>
      </form>
      <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(u: any) => u.id} emptyTitle="No universities" caption="Universities"
        columns={[
          { key: "name", header: "University", cell: (u: any) => u.name },
          { key: "slug", header: "Slug", cell: (u: any) => <span className="font-mono text-xs">{u.slug}</span> },
        ]} />
    </div>
  );
}
