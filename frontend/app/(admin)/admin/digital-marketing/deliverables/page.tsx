"use client";
import { useState } from "react";
import { DataTable } from "@/components/data-display/data-table";
import { FileUploader } from "@/components/forms/file-uploader";
import { useToast } from "@/components/feedback/toast";
import { useMarketingDeliverables, useUploadDeliverable } from "@/features/digital-marketing";
import { ProjectSelect } from "@/features/digital-marketing/components/project-select";
import { useFileUpload } from "@/hooks/use-file-upload";

export default function DeliverablesPage() {
  const [projectId, setProjectId] = useState("");
  const { data, isLoading } = useMarketingDeliverables(projectId);
  const { addToast } = useToast();
  const { upload, isUploading } = useFileUpload("marketing-deliverable", projectId);
  const uploadDeliverable = useUploadDeliverable();

  async function handleUpload(files: File[]) {
    for (const file of files) {
      try {
        const { url } = await upload(file);
        await uploadDeliverable.mutateAsync({
          projectId,
          title: file.name,
          fileUrl: url,
          fileType: file.type,
          fileSize: file.size,
        });
        addToast(`${file.name} uploaded`, "success");
      } catch {
        addToast(`Failed to upload ${file.name}`, "error");
      }
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Deliverables</h1>
      <ProjectSelect value={projectId} onChange={setProjectId} />
      {projectId && (
        <>
          <FileUploader onUpload={handleUpload} multiple />
          {(isUploading || uploadDeliverable.isPending) && <p className="text-xs opacity-60">Uploading…</p>}
          <DataTable
            data={data ?? []}
            isLoading={isLoading}
            keyExtractor={(d: any) => d.id}
            emptyTitle="No deliverables"
            caption="Deliverables"
            columns={[
              { key: "name", header: "Title", cell: (d: any) => d.title },
              { key: "date", header: "Uploaded", cell: (d: any) => new Date(d.createdAt).toLocaleDateString() },
            ]}
          />
        </>
      )}
    </div>
  );
}
