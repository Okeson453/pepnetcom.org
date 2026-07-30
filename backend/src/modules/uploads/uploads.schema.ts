import { z } from 'zod'

/**
 * Every place in the app that needs a real file upload (SIWES report
 * delivery, CMS media library, marketing deliverables — see the frontend
 * pages that reference this module) funnels through this one presign
 * endpoint rather than each having its own. Scope both namespaces the S3
 * key and drives the server-side MIME whitelist below, since the client's
 * declared contentType can't be trusted on its own.
 */
export const uploadScopes = ['siwes-report', 'cms-media', 'marketing-deliverable'] as const
export type UploadScope = (typeof uploadScopes)[number]

export const SCOPE_ALLOWED_MIME_TYPES: Record<UploadScope, string[]> = {
  'siwes-report': [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/zip',
    'application/x-zip-compressed',
  ],
  'cms-media': ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  'marketing-deliverable': [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/zip',
    'application/x-zip-compressed',
    'video/mp4',
  ],
}

export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024 // 50MB — matches the frontend FileUploader default

export const getUploadUrlSchema = z.object({
  scope: z.enum(uploadScopes),
  fileName: z.string().min(1).max(255),
  contentType: z.string().min(1),
  size: z.number().int().positive().max(MAX_UPLOAD_SIZE_BYTES),
  /** Required (and authorization-checked) for scope 'siwes-report' (an order id).
   *  Optional, key-namespacing-only for 'marketing-deliverable' (a project id). */
  parentId: z.string().optional(),
})
export type GetUploadUrlInput = z.infer<typeof getUploadUrlSchema>
