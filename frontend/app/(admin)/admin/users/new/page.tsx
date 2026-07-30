"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useCreateUser } from "@/features/users";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["CLIENT", "WRITER", "ADMIN"]),
});

type FormData = z.infer<typeof schema>;

export default function AddUserPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const mutation = useCreateUser({ onSuccess: () => router.push("/admin/users") });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Add User</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-md space-y-4">
        <FormField label="Full Name" error={errors.name?.message}><Input {...register("name")} /></FormField>
        <FormField label="Email" error={errors.email?.message}><Input type="email" {...register("email")} /></FormField>
        <FormField label="Role" error={errors.role?.message}>
          <select {...register("role")} className="w-full rounded-md border border-bone/10 bg-ink text-bone px-3 py-2 text-sm">
            <option value="CLIENT">Client</option>
            <option value="WRITER">Writer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </FormField>
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Creating..." : "Create User"}</Button>
      </form>
    </div>
  );
}
