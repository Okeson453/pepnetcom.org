"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useAnalyticsReports, useGenerateAnalyticsReport } from "@/features/analytics";

// Matches the backend's reportGenerateSchema exactly (name/type/startDate/
// endDate all required) — the previous version called mutate({}), which
// would fail the backend's own input validation on every click.
const schema = z.object({
  name: z.string().min(1, "Required"),
  type: z.enum(["sales", "signals", "website", "custom"]),
  startDate: z.string().min(1, "Required"),
  endDate: z.string().min(1, "Required"),
});
type FormData = z.infer<typeof schema>;

export default function ReportsPage() {
  const { data, isLoading } = useAnalyticsReports();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const mutation = useGenerateAnalyticsReport({
    onSuccess: () => {
      reset();
      setOpen(false);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Reports</h1>
        <Button onClick={() => setOpen(true)}>+ Generate Report</Button>
      </div>
      <DataTable
        data={data ?? []}
        isLoading={isLoading}
        keyExtractor={(r: any) => r.id}
        emptyTitle="No reports"
        caption="Analytics reports"
        columns={[
          { key: "name", header: "Report", cell: (r: any) => r.name },
          { key: "type", header: "Type", cell: (r: any) => r.type },
          { key: "generated", header: "Generated", cell: (r: any) => new Date(r.createdAt).toLocaleDateString() },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate Report</DialogTitle></DialogHeader>
          <form
            onSubmit={handleSubmit((d) =>
              mutation.mutate({ ...d, startDate: new Date(d.startDate), endDate: new Date(d.endDate) })
            )}
            className="space-y-4"
          >
            <FormField label="Report Name" error={errors.name?.message}><Input {...register("name")} /></FormField>
            <FormField label="Type" error={errors.type?.message}>
              <select {...register("type")} className="flex w-full rounded-md border border-graphite/15 bg-transparent px-3 py-2 text-sm">
                <option value="sales">Sales</option>
                <option value="signals">Signals</option>
                <option value="website">Website</option>
                <option value="custom">Custom</option>
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Date" error={errors.startDate?.message}><Input type="date" {...register("startDate")} /></FormField>
              <FormField label="End Date" error={errors.endDate?.message}><Input type="date" {...register("endDate")} /></FormField>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="secondary" type="button">Cancel</Button></DialogClose>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Generating..." : "Generate"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
