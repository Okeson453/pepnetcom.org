"use client";
import { useParams, useRouter } from "next/navigation";
import { FileUploader } from "@/components/forms/file-uploader";
import { useUploadCompletedReport } from "@/features/siwes";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useToast } from "@/components/feedback/toast";

export default function UploadWorkPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const { upload, isUploading } = useFileUpload("siwes-report", orderId);
  const mutation = useUploadCompletedReport({
    onSuccess: () => {
      addToast("Upload successful", "success");
      router.push(`/writer/assigned-orders/${orderId}`);
    },
    onError: (err: any) => addToast(err?.message ?? "Failed to register the uploaded report", "error"),
  });

  async function handleUpload(files: File[]) {
    const file = files[0];
    if (!file) return;
    try {
      const { url } = await upload(file);
      mutation.mutate({ orderId, reportUrl: url });
    } catch {
      addToast("File upload failed — please try again.", "error");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Upload Work</h1>
      <p className="text-sm opacity-60 mb-4">Order: {orderId}</p>
      <FileUploader onUpload={handleUpload} />
      {(isUploading || mutation.isPending) && (
        <p className="mt-3 text-xs opacity-60">Uploading…</p>
      )}
    </div>
  );
}
