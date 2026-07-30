"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useCreateSignal } from "@/features/signals";
import type { SignalInput } from "@/types/schemas/signal.schema";
export default function CreateSignalPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<SignalInput>({ defaultValues: { direction: "Long" } });
  const mutation = useCreateSignal({ onSuccess: () => router.push("/admin/signals") });
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Create Signal</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-md space-y-4">
        <FormField label="Pair"><Input {...register("pair")} placeholder="XAU/USD" /></FormField>
        <FormField label="Direction">
          <select {...register("direction")} className="flex w-full rounded-md border border-graphite/15 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber">
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>
        </FormField>
        <FormField label="Entry Price"><Input {...register("entryPrice")} /></FormField>
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Creating..." : "Publish Signal"}</Button>
      </form></div>);
}
