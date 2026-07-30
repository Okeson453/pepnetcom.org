export interface FileStoragePort {
  upload(file: Uint8Array, key: string, contentType: string): Promise<{ url: string; key: string }>
  delete(key: string): Promise<void>
  getSignedUrl(key: string, expiresIn?: number): Promise<string>
  /**
   * Presigned PUT URL for the client to upload directly to storage — see
   * s3.adapter.ts. `contentType`/`contentLength` are baked into the
   * signature so the storage layer itself rejects a PUT that doesn't match
   * what was declared when the URL was requested.
   */
  getUploadUrl(key: string, expiresIn: number | undefined, contentType: string, contentLength: number): Promise<string>
}
