"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useMarketingCampaigns, useCreateCampaign } from "@/features/digital-marketing";
import { ProjectSelect } from "@/features/digital-marketing/components/project-select";

// Matches the real backend's campaignCreateSchema — campaigns are scoped to
// a project (projectId required), and name/platform/startDate are all
// required, not just name (see marketing.schema.ts).
interface CampaignForm {
  name: string;
  platform: string;
  startDate: string;
}

export default function CampaignManagementPage() {
  const [projectId, setProjectId] = useState("");
  const { data, isLoading } = useMarketingCampaigns(projectId);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CampaignForm>();
  const mutation = useCreateCampaign({ onSuccess: () => reset() });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Campaign Management</h1>
      <ProjectSelect value={projectId} onChange={setProjectId} />

      {projectId && (
        <>
          <form
            onSubmit={handleSubmit((d) => mutation.mutate({ ...d, projectId, startDate: new Date(d.startDate) }))}
            className="max-w-2xl grid grid-cols-1 sm:grid-cols-[1fr_1fr_180px_auto] gap-3 items-end"
          >
            <FormField label="Name" required error={errors.name?.message}>
              <Input {...register("name", { required: "Required" })} placeholder="Campaign name" />
            </FormField>
            <FormField label="Platform" required error={errors.platform?.message}>
              <Input {...register("platform", { required: "Required" })} placeholder="Instagram, Google Ads..." />
            </FormField>
            <FormField label="Start Date" required error={errors.startDate?.message}>
              <Input type="date" {...register("startDate", { required: "Required" })} />
            </FormField>
            <Button type="submit" disabled={mutation.isPending}>Add</Button>
          </form>
          <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(c: any) => c.id} emptyTitle="No campaigns" caption="Campaigns"
            columns={[
              { key: "name", header: "Campaign", cell: (c: any) => c.name },
              { key: "platform", header: "Platform", cell: (c: any) => c.platform },
              { key: "status", header: "Status", cell: (c: any) => c.status },
            ]} />
        </>
      )}
    </div>
  );
}
