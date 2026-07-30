import { randomUUID } from 'crypto'
import { s3Adapter } from '../../integrations/storage/s3.adapter'
import { ordersRepository } from '../orders/orders.repository'
import { Ok, Err } from '../../shared/result'
import { ForbiddenError, ValidationError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import { SCOPE_ALLOWED_MIME_TYPES, type GetUploadUrlInput } from './uploads.schema'

const UPLOAD_URL_TTL_SECONDS = 900 // 15 minutes — long enough for a slow connection, short enough that a leaked URL isn't a standing hole

function safeFileNameSegment(fileName: string): string {
  // Keep only the extension from the original name — the rest of the key is
  // server-generated (scope + uuid), so nothing user-supplied ends up in
  // the S3 key path itself (no path traversal, no header injection via a
  // crafted filename).
  const ext = fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase().replace(/[^a-z0-9]/g, '') : ''
  return ext ? `.${ext.slice(0, 10)}` : ''
}

export class UploadsService {
  constructor(private orderRepo = ordersRepository) {}

  async getUploadUrl(
    input: GetUploadUrlInput,
    userId: string,
    userRole: string,
  ): Promise<Result<{ uploadUrl: string; key: string }, ForbiddenError | ValidationError>> {
    const allowedTypes = SCOPE_ALLOWED_MIME_TYPES[input.scope]
    if (!allowedTypes.includes(input.contentType)) {
      return Err(new ValidationError(`File type ${input.contentType} isn't allowed for ${input.scope} uploads`))
    }

    if (input.scope === 'siwes-report') {
      if (!input.parentId) {
        return Err(new ValidationError('parentId (orderId) is required for siwes-report uploads'))
      }
      const order = await this.orderRepo.findById(input.parentId)
      if (!order || order.serviceType !== 'SIWES') {
        return Err(new ValidationError('Order not found'))
      }
      // Same authorization rule as report-upload.service.ts's uploadReport —
      // getting a presigned URL for an order's report should require
      // exactly the same access the actual upload-completion call does,
      // otherwise this endpoint would be a way to bypass that check.
      if (userRole !== 'ADMIN' && order.assignment?.staffId !== userId) {
        return Err(new ForbiddenError('Only the assigned writer can upload this report'))
      }
    }

    if (input.scope === 'marketing-deliverable' && userRole !== 'ADMIN') {
      return Err(new ForbiddenError('Only admins can upload marketing deliverables'))
    }

    if (input.scope === 'cms-media' && userRole !== 'ADMIN') {
      return Err(new ForbiddenError('Only admins can upload CMS media'))
    }

    const key = `${input.scope}/${input.parentId ?? 'general'}/${randomUUID()}${safeFileNameSegment(input.fileName)}`
    // Binds the declared contentType/size into the presigned URL's signature
    // (see aws-sigv4.ts) so the storage layer itself enforces them — a client
    // can no longer request a URL for a small whitelisted file and then PUT
    // something larger or differently-typed to the real URL.
    const uploadUrl = await s3Adapter.getUploadUrl(key, UPLOAD_URL_TTL_SECONDS, input.contentType, input.size)
    return Ok({ uploadUrl, key })
  }
}

export const uploadsService = new UploadsService()
