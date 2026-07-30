"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import { useCreateTradeStrategy } from "@/features/trade-strategies";
import { tradeStrategySchema, type TradeStrategyInput } from "@/types/schemas/strategy.schema";

export default function AddStrategyPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<TradeStrategyInput>({
    resolver: zodResolver(tradeStrategySchema),
    defaultValues: { currency: "USD", difficulty: "beginner" },
  });
  const mutation = useCreateTradeStrategy({ onSuccess: () => router.push("/admin/trade-strategies") });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Add Strategy</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-md space-y-4">
        <FormField label="Title" required error={errors.title?.message}><Input {...register("title")} /></FormField>
        <FormField label="Slug" required error={errors.slug?.message}><Input placeholder="my-strategy-title" {...register("slug")} /></FormField>
        <FormField label="Category" required error={errors.category?.message}><Input placeholder="forex, crypto, equities..." {...register("category")} /></FormField>
        <FormField label="Difficulty">
          <select {...register("difficulty")} className="flex w-full rounded-md border border-graphite/15 bg-transparent px-3 py-2 text-sm">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Price" required error={errors.price?.message}><Input type="number" step="0.01" min="0" {...register("price")} /></FormField>
          <FormField label="Currency"><Input {...register("currency")} /></FormField>
        </div>
        <FormField label="Description" required error={errors.description?.message}><Textarea {...register("description")} /></FormField>
        <FormField label="Full Content" required error={errors.content?.message}><Textarea rows={6} {...register("content")} /></FormField>
        <FormField label="Preview URL (optional)" error={errors.previewUrl?.message}><Input {...register("previewUrl")} /></FormField>
        <FormField label="Download URL (optional)" error={errors.downloadUrl?.message}><Input {...register("downloadUrl")} /></FormField>
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save Strategy"}</Button>
      </form>
    </div>
  );
}
