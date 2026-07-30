import { createHmac, randomBytes } from 'crypto'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const TOTP_STEP_SECONDS = 30
const TOTP_DIGITS = 6
/** How many 30s steps of clock drift either direction we tolerate when checking a code. */
const TOTP_WINDOW = 1

export function generateBase32Secret(byteLength = 20): string {
  const bytes = randomBytes(byteLength)
  let bits = ''
  for (const byte of bytes) bits += byte.toString(2).padStart(8, '0')
  let secret = ''
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    secret += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)]
  }
  return secret
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = ''
  for (const char of clean) {
    const val = BASE32_ALPHABET.indexOf(char)
    if (val === -1) continue
    bits += val.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2))
  }
  return Buffer.from(bytes)
}

function hotp(secret: Buffer, counter: number): string {
  const counterBuf = Buffer.alloc(8)
  // Counter is a 64-bit big-endian integer, but JS numbers are safe up to
  // 2^53 — fine for TOTP counters (Date.now()/30s won't overflow for
  // millennia), so we only need to write the low 32 bits.
  counterBuf.writeUInt32BE(counter, 4)
  const hmac = createHmac('sha1', secret).update(counterBuf).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return String(binCode % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, '0')
}

/** Verifies a 6-digit TOTP code against a base32 secret, tolerating ±1 time step of clock drift. */
export function verifyTotpCode(base32Secret: string, code: string): boolean {
  const trimmed = code.replace(/\s+/g, '')
  if (!/^\d{6}$/.test(trimmed)) return false
  const secret = base32Decode(base32Secret)
  const counter = Math.floor(Date.now() / 1000 / TOTP_STEP_SECONDS)
  for (let drift = -TOTP_WINDOW; drift <= TOTP_WINDOW; drift++) {
    if (hotp(secret, counter + drift) === trimmed) return true
  }
  return false
}

export function buildOtpAuthUri(secret: string, email: string, issuer = 'pepnetcom'): string {
  const label = encodeURIComponent(`${issuer}:${email}`)
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(TOTP_DIGITS),
    period: String(TOTP_STEP_SECONDS),
  })
  return `otpauth://totp/${label}?${params.toString()}`
}

/** Generates human-typeable one-time backup codes (e.g. "7F3K-9QRT"), used when the authenticator device isn't available. */
export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const raw = randomBytes(5).toString('hex').toUpperCase().slice(0, 8)
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4, 8)}`)
  }
  return codes
}
