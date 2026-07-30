"use client";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useAssignWriter } from "@/features/siwes";
export default function AssignWriterPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const mutation = useAssignWriter({ onSuccess: () => router.push(`/admin/siwes/orders/${orderId}`) });
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Assign Writer</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate({ orderId: orderId as string, writerId: d.writerId }))} className="max-w-md space-y-4">
        <FormField label="Writer ID"><Input {...register("writerId")} /></FormField>
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Assigning..." : "Assign Writer"}</Button>
      </form></div>);
}
