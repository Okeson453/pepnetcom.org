"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useAssignStaff } from "@/features/orders";
export default function AssignStaffPage() {
  const { register, handleSubmit } = useForm<{ orderId: string; staffId: string }>();
  const mutation = useAssignStaff();
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Assign Staff</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-md space-y-4">
        <FormField label="Order ID"><Input {...register("orderId")} /></FormField>
        <FormField label="Staff ID"><Input {...register("staffId")} /></FormField>
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Assigning..." : "Assign"}</Button>
      </form></div>);
}
