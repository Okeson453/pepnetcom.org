import { signalsRepository } from './signals.repository'
import { redis } from '../../shared/cache/redis-client'
import { CacheKeys } from '../../shared/cache/cache-keys'
import { logger } from '../../shared/logging/logger'
import type { Signal } from '@prisma/client'

const SIGNALS_CHANNEL = 'signals:live'

// In-memory SSE clients map — local to this process. Cross-instance fan-out
// happens via the Redis pub/sub subscriber started in startSignalSubscriber().
const sseClients = new Map<string, ReadableStreamDefaultController>()

export class SignalBroadcastService {
  constructor(private repo = signalsRepository) {}

  async broadcastSignal(signal: Signal): Promise<void> {
    // §5.1 fix: only publish. Previously this ALSO iterated sseClients
    // directly, which meant (a) the publishing instance's own clients got
    // the event twice once the subscriber below existed, and (b) instances
    // that never call broadcastSignal (i.e. every replica but the one that
    // handled this request) never got it at all — the Redis publish was
    // pure dead code with nothing subscribed. Now every instance, including
    // this one, receives exactly one copy via the subscription.
    await redis.publish(SIGNALS_CHANNEL, JSON.stringify({
      type: 'SIGNAL_CREATED',
      signal,
      timestamp: new Date().toISOString(),
    }))
  }

  async broadcastSignalClose(signal: Signal): Promise<void> {
    await redis.publish(SIGNALS_CHANNEL, JSON.stringify({
      type: 'SIGNAL_CLOSED',
      signal,
      timestamp: new Date().toISOString(),
    }))
  }

  /** Called only by the Redis subscriber — fans a received message out to this process's local SSE clients. */
  deliverToLocalClients(message: string): void {
    const encoded = new TextEncoder().encode(`data: ${message}\n\n`)
    for (const [id, controller] of sseClients) {
      try {
        controller.enqueue(encoded)
      } catch {
        // Client disconnected without cancel() firing yet — drop it defensively.
        sseClients.delete(id)
      }
    }
  }

  addClient(id: string, controller: ReadableStreamDefaultController): void {
    sseClients.set(id, controller)
  }

  removeClient(id: string): void {
    sseClients.delete(id)
  }

  getClientCount(): number {
    return sseClients.size
  }
}

export const signalBroadcastService = new SignalBroadcastService()

let subscriberStarted = false

/**
 * Starts the Redis subscriber that closes the fan-out loop described in §5.1
 * of the audit. ioredis requires a *dedicated* connection for subscribe mode
 * (a connection in subscriber mode can't run other commands), so this
 * duplicates the shared client rather than reusing it. Call once at process
 * startup (web process only — see server.ts).
 */
export function startSignalSubscriber(): void {
  if (subscriberStarted) return
  subscriberStarted = true

  const subscriber = redis.duplicate()
  subscriber.on('error', (err) => {
    logger.error('Signals SSE Redis subscriber error', { error: err.message })
  })
  subscriber.subscribe(SIGNALS_CHANNEL, (err) => {
    if (err) {
      logger.error('Failed to subscribe to signals:live channel', { error: err.message })
    }
  })
  subscriber.on('message', (channel, message) => {
    if (channel !== SIGNALS_CHANNEL) return
    signalBroadcastService.deliverToLocalClients(message)
  })
}
