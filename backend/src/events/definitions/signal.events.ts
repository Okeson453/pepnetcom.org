export interface SignalCreatedEvent {
  type: 'SignalCreated'
  signalId: string
  symbol: string
  direction: string
  createdAt: string
}

export interface SignalClosedEvent {
  type: 'SignalClosed'
  signalId: string
  result: string
  closedAt: string
}

export type SignalEvent = SignalCreatedEvent | SignalClosedEvent
