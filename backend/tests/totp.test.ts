import { describe, it, expect } from 'vitest'
import {
  generateBase32Secret,
  verifyTotpCode,
  buildOtpAuthUri,
  generateBackupCodes,
} from '../src/shared/crypto/totp'
import { createHmac } from 'crypto'

// Independent HOTP/TOTP reference implementation (RFC 4226 / 6238), kept
// deliberately separate from src/shared/crypto/totp.ts's own internals so
// these tests actually catch a broken implementation instead of just
// re-asserting whatever the code already does.
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
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
function referenceCodeAt(secretB32: string, unixSeconds: number): string {
  const counter = Math.floor(unixSeconds / 30)
  const counterBuf = Buffer.alloc(8)
  counterBuf.writeUInt32BE(counter, 4)
  const hmac = createHmac('sha1', base32Decode(secretB32)).update(counterBuf).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return String(binCode % 1_000_000).padStart(6, '0')
}

describe('totp', () => {
  describe('generateBase32Secret', () => {
    it('produces a secret using only the RFC 4648 base32 alphabet', () => {
      const secret = generateBase32Secret()
      expect(secret).toMatch(/^[A-Z2-7]+$/)
      expect(secret.length).toBeGreaterThan(0)
    })

    it('produces different secrets on successive calls', () => {
      const a = generateBase32Secret()
      const b = generateBase32Secret()
      expect(a).not.toBe(b)
    })
  })

  describe('verifyTotpCode', () => {
    it('accepts the correct current code', () => {
      const secret = generateBase32Secret()
      const now = Math.floor(Date.now() / 1000)
      const code = referenceCodeAt(secret, now)
      expect(verifyTotpCode(secret, code)).toBe(true)
    })

    it('accepts a code from one step in the past (clock drift tolerance)', () => {
      const secret = generateBase32Secret()
      const now = Math.floor(Date.now() / 1000)
      const code = referenceCodeAt(secret, now - 30)
      expect(verifyTotpCode(secret, code)).toBe(true)
    })

    it('accepts a code from one step in the future (clock drift tolerance)', () => {
      const secret = generateBase32Secret()
      const now = Math.floor(Date.now() / 1000)
      const code = referenceCodeAt(secret, now + 30)
      expect(verifyTotpCode(secret, code)).toBe(true)
    })

    it('rejects a code from two steps away (outside the drift window)', () => {
      const secret = generateBase32Secret()
      const now = Math.floor(Date.now() / 1000)
      const code = referenceCodeAt(secret, now - 60)
      expect(verifyTotpCode(secret, code)).toBe(false)
    })

    it('rejects a code generated from a different secret', () => {
      const secret = generateBase32Secret()
      const otherSecret = generateBase32Secret()
      const now = Math.floor(Date.now() / 1000)
      const code = referenceCodeAt(otherSecret, now)
      expect(verifyTotpCode(secret, code)).toBe(false)
    })

    it('rejects malformed input (non-numeric, wrong length)', () => {
      const secret = generateBase32Secret()
      expect(verifyTotpCode(secret, 'abcdef')).toBe(false)
      expect(verifyTotpCode(secret, '12345')).toBe(false)
      expect(verifyTotpCode(secret, '1234567')).toBe(false)
      expect(verifyTotpCode(secret, '')).toBe(false)
    })

    it('tolerates surrounding whitespace in the submitted code', () => {
      const secret = generateBase32Secret()
      const now = Math.floor(Date.now() / 1000)
      const code = referenceCodeAt(secret, now)
      expect(verifyTotpCode(secret, ` ${code} `)).toBe(true)
    })
  })

  describe('buildOtpAuthUri', () => {
    it('embeds the secret, issuer, and email in a well-formed otpauth URI', () => {
      const uri = buildOtpAuthUri('JBSWY3DPEHPK3PXP', 'user@example.com')
      expect(uri.startsWith('otpauth://totp/')).toBe(true)
      expect(uri).toContain('secret=JBSWY3DPEHPK3PXP')
      expect(uri).toContain('issuer=pepnetcom')
      // Email is part of the URL-encoded label, not a raw query param.
      expect(decodeURIComponent(uri)).toContain('user@example.com')
    })
  })

  describe('generateBackupCodes', () => {
    it('generates the requested number of codes, each in XXXX-XXXX form', () => {
      const codes = generateBackupCodes(10)
      expect(codes).toHaveLength(10)
      for (const code of codes) {
        expect(code).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/)
      }
    })

    it('generates unique codes within a batch', () => {
      const codes = generateBackupCodes(20)
      expect(new Set(codes).size).toBe(20)
    })
  })
})
