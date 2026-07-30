import { Prisma } from '@prisma/client'
import { prisma } from './prisma-client'
import type { PrismaClient } from '@prisma/client'

export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export async function withTransaction<T>(
  fn: (tx: TransactionClient) => Promise<T>,
  options?: { isolationLevel?: Prisma.TransactionIsolationLevel; timeout?: number },
): Promise<T> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => fn(tx as unknown as TransactionClient), {
    // Default to ReadCommitted (Postgres's own default) for general use, but
    // callers touching money (payments/refunds) should pass Serializable
    // explicitly — see payments.service.ts and refund.service.ts — so
    // concurrent read-check-write sequences on the same row can't both
    // observe a stale pre-write state and commit conflicting results.
    isolationLevel: options?.isolationLevel ?? Prisma.TransactionIsolationLevel.ReadCommitted,
    timeout: options?.timeout,
  })
}
