"use client";
import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";

export type UploadScope = "siwes-report" | "cms-media" | "marketing-deliverable";

interface UploadResult {
  /** The object's base URL — a stable pointer, not a signed/fetchable link.
   *  Matches how the backend already treats "file URLs" elsewhere (see
   *  s3.adapter.ts's upload()): actual reads go through a fresh
   *  getSignedUrl(key) call server-side when the file is later viewed, this
   *  is just the identifier stored on the record. */
  url: string;
  key: string;
}

/**
 * Backed by the new `uploads.getUploadUrl` procedure (see
 * backend/src/modules/uploads) — the browser PUTs bytes straight to
 * storage, nothing is proxied through the backend/tRPC.
 */
export function useFileUpload(scope: UploadScope, parentId?: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const getUploadUrl = trpc.uploads.getUploadUrl.useMutation();

  const upload = useCallback(
    async (file: File): Promise<UploadResult> => {
      setIsUploading(true);
      setProgressError(null);
      try {
        const { uploadUrl, key } = await getUploadUrl.mutateAsync({
          scope,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          parentId,
        });

        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!putRes.ok) {
          throw new Error(`Upload failed (${putRes.status})`);
        }

        // Strip the presigned query string — see UploadResult's doc comment.
        const url = uploadUrl.split("?")[0];
        return { url, key };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setProgressError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [scope, parentId, getUploadUrl]
  );

  return { upload, isUploading, error: progressError };
}
