import { createRemoteJWKSet, jwtVerify } from 'jose'
import { env } from '../../config/env'

// Google's published JWKS for verifying ID token signatures — cached and
// auto-refreshed by jose's createRemoteJWKSet (it re-fetches on a kid miss,
// with rate-limiting built in), so this does NOT hit the network on every
// call.
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

export interface GoogleProfile {
  sub: string
  email: string
  emailVerified: boolean
  firstName: string
  lastName: string
  picture?: string
}

/**
 * Verifies a Google-issued ID token server-side: checks the signature
 * against Google's own public keys, the issuer, and that the token was
 * actually minted for *our* OAuth client (the `aud` claim) — without this
 * last check, an ID token minted for a completely different Google app
 * would still pass signature verification, since Google signs tokens for
 * every app with the same keys.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile | null> {
  if (!env.GOOGLE_CLIENT_ID) return null
  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: env.GOOGLE_CLIENT_ID,
    })

    const email = payload.email as string | undefined
    if (!email) return null

    const givenName = (payload.given_name as string | undefined) ?? ''
    const familyName = (payload.family_name as string | undefined) ?? ''
    const fullName = (payload.name as string | undefined) ?? ''
    // Google doesn't always populate given_name/family_name (depends on the
    // account's locale/setup) — fall back to splitting the full name so
    // firstName/lastName are never empty strings against a NOT NULL column.
    const [fallbackFirst, ...fallbackRest] = fullName.split(' ')

    return {
      sub: payload.sub as string,
      email,
      emailVerified: Boolean(payload.email_verified),
      firstName: givenName || fallbackFirst || 'Google',
      lastName: familyName || fallbackRest.join(' ') || 'User',
      picture: payload.picture as string | undefined,
    }
  } catch {
    return null
  }
}
