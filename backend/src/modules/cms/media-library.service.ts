import { cmsRepository } from './cms.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { MediaAsset } from '@prisma/client'

export class MediaLibraryService {
  constructor(private repo = cmsRepository) {}

  async listAssets(): Promise<MediaAsset[]> {
    return this.repo.findMediaAssets(50)
  }

  async uploadAsset(input: any): Promise<MediaAsset> {
    return this.repo.createMediaAsset({
      filename: input.filename,
      originalName: input.originalName,
      mimeType: input.mimeType,
      size: input.size,
      url: input.url,
      folder: input.folder,
    })
  }

  async deleteAsset(id: string): Promise<Result<MediaAsset, NotFoundError>> {
    const asset = await this.repo.findMediaAssetById(id)
    if (!asset) {
      return Err(new NotFoundError('Media Asset', id))
    }
    await this.repo.deleteMediaAsset(id)
    return Ok(asset)
  }
}

export const mediaLibraryService = new MediaLibraryService()
