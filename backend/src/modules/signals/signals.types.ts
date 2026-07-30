import type { Signal, SignalPerformance, SignalSubscription } from '@prisma/client'

export interface SignalWithPerformance extends Signal {
  performances: SignalPerformance[]
}

export interface PerformanceStats {
  totalSignals: number
  winCount: number
  lossCount: number
  breakEvenCount: number
  winRate: number
  averagePips: number
  averageRr: number
  last30Days: number
}

export interface LiveSignalEvent {
  type: 'SIGNAL_CREATED' | 'SIGNAL_CLOSED' | 'SIGNAL_UPDATED'
  signal: Signal
  timestamp: string
}
