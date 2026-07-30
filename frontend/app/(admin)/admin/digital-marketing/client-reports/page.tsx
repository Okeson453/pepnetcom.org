"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useMarketingReports, useGenerateMarketingReport } from "@/features/digital-marketing";
import { ProjectSelect } from "@/features/digital-marketing/components/project-select";

// Matches the real backend's reportGenerateSchema — title/projectId/
// periodStart/periodEnd are all required (see marketing.schema.ts). The
// previous version called mutate({}), which the backend would reject.
interface ReportForm {
  title: string;
  periodStart: string;
  periodEnd: string;
}

export default function ClientReportsPage() {
  const [projectId, setProjectId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useMarketingReports(projectId);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReportForm>();
  const mutation = useGenerateMarketingReport({
    onSuccess: () => {
      reset();
      setDialogOpen(false);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Client Reports</h1>
        <Button onClick={() => setDialogOpen(true)} disabled={!projectId}>Generate</Button>
      </div>
      <div className="mb-6"><ProjectSelect value={projectId} onChange={setProjectId} /></div>

      {projectId && (
        <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(r: any) => r.id} emptyTitle="No reports" caption="Client reports"
          columns={[
            { key: "title", header: "Title", cell: (r: any) => r.title },
            { key: "period", header: "Period", cell: (r: any) => `${new Date(r.periodStart).toLocaleDateString()} – ${new Date(r.periodEnd).toLocaleDateString()}` },
            { key: "generated", header: "Generated", cell: (r: any) => new Date(r.createdAt).toLocaleDateString() },
          ]} />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate Report</DialogTitle></DialogHeader>
          <form
            onSubmit={handleSubmit((d) =>
              mutation.mutate({ ...d, projectId, periodStart: new Date(d.periodStart), periodEnd: new Date(d.periodEnd) })
            )}
            className="space-y-4"
          >
            <FormField label="Title" required error={errors.title?.message}><Input {...register("title", { required: "Required" })} /></FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Period Start" required error={errors.periodStart?.message}><Input type="date" {...register("periodStart", { required: "Required" })} /></FormField>
              <FormField label="Period End" required error={errors.periodEnd?.message}><Input type="date" {...register("periodEnd", { required: "Required" })} /></FormField>
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
