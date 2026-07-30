"use client";
import { useForm } from "react-hook-form";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useCategories, useCreateCategory } from "@/features/cms";

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Matches the real backend's categoryCreateSchema — `slug` is required
// (see cms.schema.ts). Auto-derived from the name rather than asking the
// admin to type a second, redundant field.
export default function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string }>();
  const mutation = useCreateCategory({ onSuccess: () => reset() });
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Categories</h1>
      <form
        onSubmit={handleSubmit((d) => mutation.mutate({ name: d.name, slug: slugify(d.name) }))}
        className="max-w-md flex gap-3"
      >
        <FormField label="Name" required error={errors.name?.message} className="flex-1">
          <Input {...register("name", { required: "Required" })} placeholder="Category name" />
        </FormField>
        <Button type="submit" disabled={mutation.isPending} className="mt-6">Add</Button>
      </form>
      <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(c: any) => c.id} emptyTitle="No categories" caption="Categories"
        columns={[
          { key: "name", header: "Category", cell: (c: any) => c.name },
          { key: "slug", header: "Slug", cell: (c: any) => <span className="font-mono text-xs">{c.slug}</span> },
        ]} />
    </div>
  );
}
