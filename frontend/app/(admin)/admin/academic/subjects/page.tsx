"use client";
import { useForm } from "react-hook-form";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useAcademicSubjects, useCreateAcademicSubject } from "@/features/academic-services";

// Matches the real backend's subjectCreateSchema — `code` is required, not
// just `name` (see academic.schema.ts).
export default function SubjectManagementPage() {
  const { data, isLoading } = useAcademicSubjects();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string; code: string }>();
  const mutation = useCreateAcademicSubject({ onSuccess: () => reset() });
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Subject Management</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-lg flex gap-3 items-start">
        <FormField label="Name" required error={errors.name?.message} className="flex-1">
          <Input {...register("name", { required: "Required" })} placeholder="New subject name" />
        </FormField>
        <FormField label="Code" required error={errors.code?.message}>
          <Input {...register("code", { required: "Required" })} placeholder="CSC101" className="w-28" />
        </FormField>
        <Button type="submit" disabled={mutation.isPending} className="mt-6">Add</Button>
      </form>
      <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(s: any) => s.id} emptyTitle="No subjects" caption="Subjects"
        columns={[
          { key: "code", header: "Code", cell: (s: any) => <span className="font-mono text-xs">{s.code}</span> },
          { key: "name", header: "Subject", cell: (s: any) => s.name },
          { key: "created", header: "Added", cell: (s: any) => new Date(s.createdAt).toLocaleDateString() },
        ]} />
    </div>
  );
}
