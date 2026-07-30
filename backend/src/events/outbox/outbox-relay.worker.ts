import { outboxRepository } from './outbox.repository'
import { eventBus } from '../event-bus'
import { logger } from '../../shared/logging/logger'

const EVENT_TYPE_MAP: Record<string, string> = {
  OrderPaid: 'order.paid',
  OrderAssigned: 'order.assigned',
  OrderDelivered: 'order.delivered',
  SignalCreated: 'signal.created',
  SignalClosed: 'signal.closed',
  PaymentSucceeded: 'payment.succeeded',
  RefundIssued: 'payment.refund.issued',
}

export async function runOutboxRelay(): Promise<void> {
  const events = await outboxRepository.claimPending(100)
  logger.info(`Outbox relay processing ${events.length} events`)

  for (const event of events) {
    try {
      const busEventType = EVENT_TYPE_MAP[event.type] ?? event.type
      await eventBus.emit(busEventType, event.payload)
      await outboxRepository.markProcessed(event.id)
    } catch (err) {
      logger.error('Outbox relay failed for event', { eventId: event.id, error: (err as Error).message })
      await outboxRepository.markFailed(event.id, (err as Error).message)
    }
  }
}
