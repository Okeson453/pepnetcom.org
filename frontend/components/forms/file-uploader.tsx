"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
  /** Comma-separated MIME types / extensions passed to the native input, e.g. "application/pdf,.docx,.zip". Also enforced in JS below — the native `accept` attribute is a UI hint only and doesn't block drag-and-drop or a user renaming a file's extension. */
  accept?: string;
  /** MIME types allowed. Defaults to the PDF/DOCX/ZIP set implied by the previous placeholder copy. Validated against `file.type`, which the browser derives from content sniffing where possible — not purely the extension. */
  allowedMimeTypes?: string[];
  /** Max size per file in bytes. Defaults to 50MB. */
  maxSizeBytes?: number;
  multiple?: boolean;
  className?: string;
}

const DEFAULT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // legacy .doc
  "application/zip",
  "application/x-zip-compressed",
];
const DEFAULT_MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function FileUploader({
  onUpload,
  accept = ".pdf,.docx,.doc,.zip",
  allowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  multiple,
  className,
}: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(
    (files: File[]): { valid: File[]; rejected: string[] } => {
      const valid: File[] = [];
      const rejected: string[] = [];
      for (const file of files) {
        if (!allowedMimeTypes.includes(file.type)) {
          rejected.push(`${file.name}: unsupported file type`);
          continue;
        }
        if (file.size > maxSizeBytes) {
          rejected.push(`${file.name}: exceeds ${formatBytes(maxSizeBytes)} limit`);
          continue;
        }
        valid.push(file);
      }
      return { valid, rejected };
    },
    [allowedMimeTypes, maxSizeBytes]
  );

  const processFiles = useCallback(
    (files: File[]) => {
      const { valid, rejected } = validate(files);
      if (rejected.length > 0) {
        setError(rejected.join("; "));
      } else {
        setError(null);
      }
      // NOTE: this is client-side validation for UX only (fast feedback,
      // avoids an unnecessary upload attempt). It is not a security
      // boundary — the real backend must re-validate MIME type and size
      // server-side before accepting any upload, since a client can send
      // whatever bytes/headers it wants regardless of what this component
      // allowed through.
      if (valid.length > 0) onUpload(valid);
    },
    [onUpload, validate]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      processFiles(Array.from(e.dataTransfer.files));
    },
    [processFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      processFiles(files);
      // Reset so selecting the same file again after a rejection re-fires onChange.
      e.target.value = "";
    },
    [processFiles]
  );

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center hover:border-amber/50 transition-colors cursor-pointer",
          error ? "border-rust/50" : "border-graphite/15",
          className
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <p className="text-sm font-medium mb-1">Drop files here or click to upload</p>
          <p className="text-xs opacity-50">PDF, DOCX, ZIP up to {formatBytes(maxSizeBytes)}</p>
        </label>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-rust">
          {error}
        </p>
      )}
    </div>
  );
}
