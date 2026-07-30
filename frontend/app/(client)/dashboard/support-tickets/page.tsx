"use client";
import { useForm } from "react-hook-form";
import { useSupportTickets, useCreateSupportTicket } from "@/features/tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/form-field";
import { DataTable } from "@/components/data-display/data-table";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";

export default function SupportTicketsPage() {
  const { cursor, hasPrev, goToNext, goToPrev } = useCursorPagination();
  const { data, isLoading } = useSupportTickets({ cursor });
  const { register, handleSubmit, reset } = useForm<{ subject: string; message: string }>();
  const mutation = useCreateSupportTicket({ onSuccess: () => reset() });
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Support Tickets</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-md space-y-3">
        <FormField label="Subject"><Input {...register("subject")} /></FormField>
        <FormField label="Message"><Textarea {...register("message")} /></FormField>
        <Button type="submit" disabled={mutation.isPending}>Create Ticket</Button>
      </form>
      <DataTable data={data?.items ?? []} isLoading={isLoading} keyExtractor={(t: any) => t.id} emptyTitle="No tickets"
        pagination={{ hasNext: data?.hasMore ?? false, hasPrev, onNext: () => goToNext(data?.nextCursor), onPrev: goToPrev }}
        columns={[
          { key: "id", header: "ID", cell: (t: any) => <span className="font-mono text-xs">{t.id}</span> },
          { key: "subject", header: "Subject", cell: (t: any) => t.subject },
          { key: "status", header: "Status", cell: (t: any) => t.status },
        ]} />
    </div>);
}
