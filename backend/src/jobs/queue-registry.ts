import { Queue, Worker, type Job } from 'bullmq'
import { redis } from '../shared/cache/redis-client'
import { logger } from '../shared/logging/logger'

export const queues = {
  orderNotifications: new Queue('order-notifications', { connection: redis }),
  reportDelivery: new Queue('report-delivery', { connection: redis }),
  signalBroadcast: new Queue('signal-broadcast', { connection: redis }),
  invoiceGeneration: new Queue('invoice-generation', { connection: redis }),
  emailBroadcast: new Queue('email-broadcast', { connection: redis }),
  subscriptionRenewal: new Queue('subscription-renewal', { connection: redis }),
  analyticsRollup: new Queue('analytics-rollup', { connection: redis }),
}

export async function addJob<T>(queueName: keyof typeof queues, data: T, opts?: any): Promise<Job<T>> {
  return queues[queueName].add(queueName, data, opts)
}
