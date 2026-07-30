import { logger } from '../shared/logging/logger'

type EventHandler<T> = (event: T) => Promise<void> | void

class EventBus {
  private handlers = new Map<string, EventHandler<any>[]>()

  on<T>(eventType: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventType) ?? []
    existing.push(handler)
    this.handlers.set(eventType, existing)
  }

  async emit<T>(eventType: string, event: T): Promise<void> {
    const handlers = this.handlers.get(eventType) ?? []
    for (const handler of handlers) {
      try {
        await handler(event)
      } catch (err) {
        logger.error(`Event handler failed for ${eventType}`, { error: (err as Error).message })
      }
    }
  }
}

export const eventBus = new EventBus()
