"use client";
import { DataTable } from "@/components/data-display/data-table";
import { FileUploader } from "@/components/forms/file-uploader";
import { useToast } from "@/components/feedback/toast";
import { useMediaLibrary, useUploadMedia } from "@/features/cms";
import { useFileUpload } from "@/hooks/use-file-upload";

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export default function MediaLibraryPage() {
  const { data, isLoading } = useMediaLibrary();
  const { addToast } = useToast();
  const { upload, isUploading } = useFileUpload("cms-media");
  const uploadMedia = useUploadMedia();

  async function handleUpload(files: File[]) {
    for (const file of files) {
      try {
        const { url } = await upload(file);
        await uploadMedia.mutateAsync({
          filename: url.split("/").pop() ?? file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url,
          folder: "uploads",
        });
        addToast(`${file.name} uploaded`, "success");
      } catch {
        addToast(`Failed to upload ${file.name}`, "error");
      }
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Media Library</h1>
      <FileUploader onUpload={handleUpload} accept="image/*" allowedMimeTypes={IMAGE_MIME_TYPES} multiple />
      {(isUploading || uploadMedia.isPending) && <p className="text-xs opacity-60">Uploading…</p>}
      <DataTable
        data={data ?? []}
        isLoading={isLoading}
        keyExtractor={(m: any) => m.id}
        emptyTitle="No media"
        caption="Media library"
        columns={[
          { key: "name", header: "File", cell: (m: any) => m.originalName },
          { key: "type", header: "Type", cell: (m: any) => m.mimeType },
          { key: "size", header: "Size", cell: (m: any) => `${(m.size / 1024).toFixed(1)} KB` },
        ]}
      />
    </div>
  );
}
