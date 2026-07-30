import { env } from '../../config/env'
import type { FileStoragePort } from './file-storage.port'
import { signS3Request, presignGetUrl, presignPutUrl } from './aws-sigv4'

const REQUEST_TIMEOUT_MS = 15000

export class S3Adapter implements FileStoragePort {
  private endpoint = env.S3_ENDPOINT
  private bucket = env.S3_BUCKET_NAME
  private accessKey = env.S3_ACCESS_KEY_ID
  private secretKey = env.S3_SECRET_ACCESS_KEY
  private region = env.S3_REGION

  async upload(file: Uint8Array, key: string, contentType: string): Promise<{ url: string; key: string }> {
    const { url, headers } = signS3Request({
      method: 'PUT',
      endpoint: this.endpoint,
      bucket: this.bucket,
      key,
      region: this.region,
      accessKeyId: this.accessKey,
      secretAccessKey: this.secretKey,
      body: file,
      contentType,
    })
    const res = await fetch(url, {
      method: 'PUT',
      headers,
      // Cast needed because TS 5.7+'s generic Uint8Array<ArrayBufferLike>
      // doesn't structurally match lib.dom.d.ts's BodyInit under strict
      // checking, even though every real fetch implementation (Bun, Node,
      // browsers) accepts a Uint8Array body just fine at runtime.
      body: file as BodyInit,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (!res.ok) {
      throw new Error(`S3 upload failed (${res.status}): ${await res.text()}`)
    }
    return { url, key }
  }

  async delete(key: string): Promise<void> {
    const { url, headers } = signS3Request({
      method: 'DELETE',
      endpoint: this.endpoint,
      bucket: this.bucket,
      key,
      region: this.region,
      accessKeyId: this.accessKey,
      secretAccessKey: this.secretKey,
    })
    const res = await fetch(url, {
      method: 'DELETE',
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (!res.ok && res.status !== 404) {
      throw new Error(`S3 delete failed (${res.status}): ${await res.text()}`)
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return presignGetUrl({
      endpoint: this.endpoint,
      bucket: this.bucket,
      key,
      region: this.region,
      accessKeyId: this.accessKey,
      secretAccessKey: this.secretKey,
      expiresIn,
    })
  }

  async getUploadUrl(key: string, expiresIn = 900, contentType: string, contentLength: number): Promise<string> {
    return presignPutUrl(
      {
        endpoint: this.endpoint,
        bucket: this.bucket,
        key,
        region: this.region,
        accessKeyId: this.accessKey,
        secretAccessKey: this.secretKey,
        expiresIn,
      },
      { contentType, contentLength },
    )
  }
}

export const s3Adapter = new S3Adapter()
