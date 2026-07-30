"use client";
import { useForm } from "react-hook-form";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import { useFaqs, useCreateFaq } from "@/features/cms";
export default function FAQsPage() {
  const { data, isLoading } = useFaqs();
  const { register, handleSubmit, reset } = useForm<{ question: string; answer: string }>();
  const mutation = useCreateFaq({ onSuccess: () => reset() });
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">FAQs</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-md space-y-3">
        <FormField label="Question"><Input {...register("question")} /></FormField>
        <FormField label="Answer"><Textarea {...register("answer")} /></FormField>
        <Button type="submit" disabled={mutation.isPending}>Add FAQ</Button>
      </form>
      <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(f: any) => f.id} emptyTitle="No FAQs"
        columns={[
          { key: "question", header: "Question", cell: (f: any) => f.question },
          { key: "answer", header: "Answer", cell: (f: any) => <span className="max-w-xs truncate block">{f.answer}</span> },
        ]} /></div>);
}
