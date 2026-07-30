import { createHash, createHmac } from 'crypto'

const SERVICE = 's3'
const ALGORITHM = 'AWS4-HMAC-SHA256'

function sha256hex(data: string | Uint8Array): string {
  return createHash('sha256').update(data).digest('hex')
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data, 'utf8').digest()
}

function amzDate(now = new Date()): { amzDate: string; dateStamp: string } {
  const iso = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  return { amzDate: iso, dateStamp: iso.slice(0, 8) }
}

function signingKey(secretKey: string, dateStamp: string, region: string): Buffer {
  const kDate = hmac(`AWS4${secretKey}`, dateStamp)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, SERVICE)
  return hmac(kService, 'aws4_request')
}

interface SignRequestParams {
  method: string
  endpoint: string // e.g. https://<accountid>.r2.cloudflarestorage.com
  bucket: string
  key: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  body?: Uint8Array
  contentType?: string
}

/**
 * Signs a PUT/DELETE/GET request with SigV4 in the Authorization header
 * (used for the actual upload/delete calls, not for generating a shareable URL).
 */
export function signS3Request(params: SignRequestParams): { url: string; headers: Record<string, string> } {
  const { method, endpoint, bucket, key, region, accessKeyId, secretAccessKey, body, contentType } = params
  const url = new URL(`${endpoint}/${bucket}/${key}`)
  const host = url.host
  const { amzDate: amz, dateStamp } = amzDate()
  const payloadHash = sha256hex(body ?? new Uint8Array(0))

  const headersToSign: Record<string, string> = {
    host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amz,
  }
  if (contentType) headersToSign['content-type'] = contentType

  const sortedHeaderNames = Object.keys(headersToSign).sort()
  const canonicalHeaders = sortedHeaderNames.map((h) => `${h}:${headersToSign[h]}\n`).join('')
  const signedHeaders = sortedHeaderNames.join(';')

  const canonicalRequest = [
    method,
    url.pathname,
    url.search.replace(/^\?/, ''),
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const credentialScope = `${dateStamp}/${region}/${SERVICE}/aws4_request`
  const stringToSign = [ALGORITHM, amz, credentialScope, sha256hex(canonicalRequest)].join('\n')

  const signature = createHmac('sha256', signingKey(secretAccessKey, dateStamp, region))
    .update(stringToSign, 'utf8')
    .digest('hex')

  const authorization = `${ALGORITHM} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  return {
    url: url.toString(),
    headers: {
      ...(contentType ? { 'Content-Type': contentType } : {}),
      'X-Amz-Content-Sha256': payloadHash,
      'X-Amz-Date': amz,
      Authorization: authorization,
    },
  }
}

interface PresignParams {
  endpoint: string
  bucket: string
  key: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  expiresIn: number
}

/**
 * Builds a presigned URL via SigV4 query-string signing — everything the
 * signature needs lives in the query string, no headers required beyond the
 * signed ones, so the resulting URL works from a plain browser
 * `fetch`/`<a href>` with no other auth. Used for both downloads (GET) and
 * direct-to-storage uploads (PUT) — see presignGetUrl/presignPutUrl below.
 *
 * `enforcedHeaders` lets the caller bind extra request headers (content-type,
 * content-length) into the signature itself. When present, S3/R2 will only
 * accept the PUT if the client sends headers that match exactly — this is
 * what makes the declared size/type from uploads.getUploadUrl actually
 * enforced at the storage layer, instead of only checked against a whitelist
 * before the URL is issued and then never verified again.
 */
function presignUrl(method: 'GET' | 'PUT', params: PresignParams, enforcedHeaders?: Record<string, string>): string {
  const { endpoint, bucket, key, region, accessKeyId, secretAccessKey, expiresIn } = params
  const url = new URL(`${endpoint}/${bucket}/${key}`)
  const host = url.host
  const { amzDate: amz, dateStamp } = amzDate()
  const credentialScope = `${dateStamp}/${region}/${SERVICE}/aws4_request`

  const extraHeaders = enforcedHeaders ?? {}
  const signedHeaderNames = ['host', ...Object.keys(extraHeaders)].sort()
  const signedHeaders = signedHeaderNames.join(';')

  const query = new URLSearchParams({
    'X-Amz-Algorithm': ALGORITHM,
    'X-Amz-Credential': `${accessKeyId}/${credentialScope}`,
    'X-Amz-Date': amz,
    'X-Amz-Expires': String(expiresIn),
    'X-Amz-SignedHeaders': signedHeaders,
  })
  // Sort query params per SigV4 canonicalization requirements
  const sortedQuery = Array.from(query.entries()).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  const canonicalQueryString = sortedQuery
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  const allHeaders: Record<string, string> = { host, ...extraHeaders }
  const canonicalHeaders = signedHeaderNames.map((h) => `${h}:${allHeaders[h]}\n`).join('')

  const canonicalRequest = [
    method,
    url.pathname,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n')

  const stringToSign = [ALGORITHM, amz, credentialScope, sha256hex(canonicalRequest)].join('\n')
  const signature = createHmac('sha256', signingKey(secretAccessKey, dateStamp, region))
    .update(stringToSign, 'utf8')
    .digest('hex')

  return `${url.origin}${url.pathname}?${canonicalQueryString}&X-Amz-Signature=${signature}`
}

export function presignGetUrl(params: PresignParams): string {
  return presignUrl('GET', params)
}

/**
 * Presigned PUT URL for direct browser-to-storage uploads — the client PUTs
 * the raw file bytes straight to this URL. When `contentType`/`contentLength`
 * are provided, they're baked into the signature as required headers: S3/R2
 * rejects the PUT outright if the request's actual `Content-Type` or
 * `Content-Length` don't match what was declared when the URL was issued.
 * That's what closes the gap where a client could request a URL for a small
 * whitelisted file and then PUT something larger or differently-typed to the
 * real URL — the mismatch now fails at the storage layer, not just at the
 * whitelist check before the URL was handed out.
 */
export function presignPutUrl(
  params: PresignParams,
  contentBinding?: { contentType: string; contentLength: number },
): string {
  const enforcedHeaders = contentBinding
    ? { 'content-length': String(contentBinding.contentLength), 'content-type': contentBinding.contentType }
    : undefined
  return presignUrl('PUT', params, enforcedHeaders)
}
