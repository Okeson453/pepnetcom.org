-- Adds the 2FA columns that schema.prisma already declares on User but that
-- never got a migration (this sandbox can't reach Prisma's engine binary, so
-- `prisma migrate dev` couldn't be run here — see audit finding #2).
--
-- Hand-written, not generated. Before applying to any real database, prefer
-- running `npx prisma migrate dev` locally against the actual schema, which
-- will generate an equivalent (and Prisma-verified) migration; use this file
-- as a stand-in only if that isn't an option in your environment. Either way,
-- back up the `users` table first, as with any migration touching it.
--
-- All three columns are backfill-safe for existing rows: twoFactorEnabled
-- defaults to false and twoFactorSecret defaults to NULL, so every existing
-- user simply has 2FA "off" until they explicitly opt in, matching the
-- application's actual behavior (2FA is never enabled without a confirmed
-- setup — see auth.service.ts). twoFactorBackupCodes defaults to an empty
-- array for the same reason: nobody has backup codes until they've set up 2FA.

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "two_factor_secret" TEXT,
  ADD COLUMN IF NOT EXISTS "two_factor_backup_codes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
