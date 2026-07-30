"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import { useCreateEmailBroadcast, useSendEmailBroadcast } from "@/features/communication";

// Matches the real backend's emailBroadcastCreateSchema — `name` (an
// internal label distinct from the email `subject`) is required. Sending
// is a separate step (emailBroadcast.send) after the broadcast is created.
interface BroadcastForm {
  name: string;
  subject: string;
  body: string;
}

export default function EmailBroadcastPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BroadcastForm>();
  const sendBroadcast = useSendEmailBroadcast();
  const createBroadcast = useCreateEmailBroadcast({
    onSuccess: (created: any) => {
      sendBroadcast.mutate({ id: created.id });
      reset();
    },
  });
  const isPending = createBroadcast.isPending || sendBroadcast.isPending;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Email Broadcast</h1>
      <form onSubmit={handleSubmit((d) => createBroadcast.mutate(d))} className="max-w-lg space-y-4">
        <FormField label="Broadcast Name" required error={errors.name?.message}>
          <Input {...register("name", { required: "Required" })} placeholder="e.g. July product update" />
        </FormField>
        <FormField label="Subject" required error={errors.subject?.message}>
          <Input {...register("subject", { required: "Required" })} />
        </FormField>
        <FormField label="Body" required error={errors.body?.message}>
          <Textarea {...register("body", { required: "Required" })} rows={6} />
        </FormField>
        <Button type="submit" disabled={isPending}>{isPending ? "Sending..." : "Create & Send"}</Button>
      </form>
    </div>
  );
}
