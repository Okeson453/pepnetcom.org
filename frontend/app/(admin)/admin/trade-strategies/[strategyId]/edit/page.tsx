"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import { useTradeStrategy, useUpdateTradeStrategy } from "@/features/trade-strategies";
import { tradeStrategyUpdateSchema, type TradeStrategyUpdateInput } from "@/types/schemas/strategy.schema";

export default function EditStrategyPage() {
  const { strategyId } = useParams();
  const router = useRouter();
  const { data: strategy, isLoading } = useTradeStrategy(strategyId as string);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TradeStrategyUpdateInput>({
    resolver: zodResolver(tradeStrategyUpdateSchema),
  });
  const mutation = useUpdateTradeStrategy({ onSuccess: () => router.push("/admin/trade-strategies") });

  useEffect(() => {
    if (strategy) reset(strategy as any);
  }, [strategy, reset]);

  if (isLoading) return <div className="max-w-md animate-pulse h-96 rounded-lg bg-graphite/5" />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Edit Strategy</h1>
      <form
        onSubmit={handleSubmit((d) => mutation.mutate({ id: strategyId as string, data: d }))}
        className="max-w-md space-y-4"
      >
        <FormField label="Title" error={errors.title?.message}><Input {...register("title")} /></FormField>
        <FormField label="Slug" error={errors.slug?.message}><Input {...register("slug")} /></FormField>
        <FormField label="Category" error={errors.category?.message}><Input {...register("category")} /></FormField>
        <FormField label="Difficulty">
          <select {...register("difficulty")} className="flex w-full rounded-md border border-graphite/15 bg-transparent px-3 py-2 text-sm">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Price" error={errors.price?.message}><Input type="number" step="0.01" min="0" {...register("price")} /></FormField>
          <FormField label="Currency"><Input {...register("currency")} /></FormField>
        </div>
        <FormField label="Description" error={errors.description?.message}><Textarea {...register("description")} /></FormField>
        <FormField label="Full Content" error={errors.content?.message}><Textarea rows={6} {...register("content")} /></FormField>
        <FormField label="Preview URL" error={errors.previewUrl?.message}><Input {...register("previewUrl")} /></FormField>
        <FormField label="Download URL" error={errors.downloadUrl?.message}><Input {...register("downloadUrl")} /></FormField>
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Update"}</Button>
      </form>
    </div>
  );
}
