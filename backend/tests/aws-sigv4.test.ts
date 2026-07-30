import { describe, it, expect } from 'vitest'
import { presignPutUrl, presignGetUrl } from '../src/integrations/storage/aws-sigv4'

const baseParams = {
  endpoint: 'https://test-account.r2.cloudflarestorage.com',
  bucket: 'test-bucket',
  key: 'cms-media/general/some-uuid.png',
  region: 'auto',
  accessKeyId: 'AKIATEST',
  secretAccessKey: 'test-secret-key',
  expiresIn: 900,
}

describe('presignPutUrl — content-type/content-length signature binding (audit #4)', () => {
  it('signs only "host" when no content binding is supplied (back-compat / GET behavior)', () => {
    const url = presignGetUrl(baseParams)
    const parsed = new URL(url)
    expect(parsed.searchParams.get('X-Amz-SignedHeaders')).toBe('host')
  })

  it('includes content-length and content-type in X-Amz-SignedHeaders when a binding is supplied', () => {
    const url = presignPutUrl(baseParams, { contentType: 'image/png', contentLength: 12345 })
    const parsed = new URL(url)
    const signedHeaders = parsed.searchParams.get('X-Amz-SignedHeaders')
    expect(signedHeaders).toContain('host')
    expect(signedHeaders).toContain('content-length')
    expect(signedHeaders).toContain('content-type')
  })

  it('produces a different signature for different declared content lengths', () => {
    const urlSmall = presignPutUrl(baseParams, { contentType: 'image/png', contentLength: 1000 })
    const urlLarge = presignPutUrl(baseParams, { contentType: 'image/png', contentLength: 5_000_000_000 })
    const sigSmall = new URL(urlSmall).searchParams.get('X-Amz-Signature')
    const sigLarge = new URL(urlLarge).searchParams.get('X-Amz-Signature')
    expect(sigSmall).not.toBe(sigLarge)
  })

  it('produces a different signature for different declared content types', () => {
    const urlPng = presignPutUrl(baseParams, { contentType: 'image/png', contentLength: 1000 })
    const urlSvg = presignPutUrl(baseParams, { contentType: 'image/svg+xml', contentLength: 1000 })
    const sigPng = new URL(urlPng).searchParams.get('X-Amz-Signature')
    const sigSvg = new URL(urlSvg).searchParams.get('X-Amz-Signature')
    expect(sigPng).not.toBe(sigSvg)
  })

  it('produces a different signature than the unbound (no content-type/length) case', () => {
    const unbound = presignPutUrl(baseParams)
    const bound = presignPutUrl(baseParams, { contentType: 'image/png', contentLength: 1000 })
    const sigUnbound = new URL(unbound).searchParams.get('X-Amz-Signature')
    const sigBound = new URL(bound).searchParams.get('X-Amz-Signature')
    expect(sigUnbound).not.toBe(sigBound)
    expect(new URL(unbound).searchParams.get('X-Amz-SignedHeaders')).toBe('host')
  })
})
