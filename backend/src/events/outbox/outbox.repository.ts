import { prisma } from '../../shared/db/prisma-client'
import type { OutboxEvent } from '@prisma/client'

export class OutboxRepository {
  async createEvent(type: string, payload: any, aggregateId: string): Promise<OutboxEvent> {
    return prisma.outboxEvent.create({
      data: {
        type,
        payload,
        aggregateId,
        status: 'PENDING',
      },
    })
  }

  /**
   * Atomically claims a batch of PENDING events by flipping them to PROCESSING
   * using `FOR UPDATE SKIP LOCKED`. Safe under any number of concurrent
   * replicas/instances polling at once — each one claims a disjoint set of
   * rows, so the same event can never be picked up and processed twice.
   */
  async claimPending(limit = 100): Promise<OutboxEvent[]> {
    return prisma.$queryRaw<OutboxEvent[]>`
      UPDATE outbox_events
      SET status = 'PROCESSING'
      WHERE id IN (
        SELECT id FROM outbox_events
        WHERE status = 'PENDING'
        ORDER BY created_at ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *
    `
  }

  async markProcessed(id: string): Promise<void> {
    await prisma.outboxEvent.update({
      where: { id },
      data: { status: 'PROCESSED', processedAt: new Date() },
    })
  }

  async markFailed(id: string, error: string): Promise<void> {
    const event = await prisma.outboxEvent.findUnique({ where: { id } })
    if (!event) return
    await prisma.outboxEvent.update({
      where: { id },
      data: {
        // Retryable failures go back to PENDING so a future claim picks them up again;
        // exhausted retries land in the terminal FAILED state.
        status: event.retryCount >= 3 ? 'FAILED' : 'PENDING',
        retryCount: { increment: 1 },
        error: error.substring(0, 500),
      },
    })
  }
}

export const outboxRepository = new OutboxRepository()
