import { signalsRepository } from './signals.repository'
import { paymentsService } from '../payments/payments.service'
import { SIGNAL_PLAN_CATALOG, type SignalPlanKey } from './signals.schema'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ConflictError, ValidationError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { SignalSubscription } from '@prisma/client'
import type { GatewayName } from '../../integrations/payments/payment-gateway.port'

export class SubscriberManagementService {
  constructor(private repo = signalsRepository) {}

  async listSubscribers(): Promise<SignalSubscription[]> {
    return this.repo.findSubscribers()
  }

  async updateStatus(id: string, status: string): Promise<Result<SignalSubscription, NotFoundError>> {
    const subscribers = await this.repo.findSubscribers({ id })
    if (subscribers.length === 0) {
      return Err(new NotFoundError('Subscriber', id))
    }
    const updated = await this.repo.updateSubscriber(id, { status: status as any })
    return Ok(updated)
  }

  /**
   * §9.2 fix: this was the missing creation path — nothing anywhere ever
   * created a SignalSubscription, so the only way one could exist was via
   * direct DB/admin action, yet gated features checked for one as if a real
   * checkout flow existed. Same pattern as strategy purchases: create
   * PENDING, hand back a gateway session, only flip ACTIVE in verifyPayment.
   */
  async subscribe(
    userId: string,
    plan: SignalPlanKey,
    gateway: GatewayName,
    email: string,
  ): Promise<Result<{ authorizationUrl: string; paymentId: string; subscriptionId: string }, ConflictError | ValidationError | NotFoundError>> {
    const active = await this.repo.findActiveSubscription(userId)
    if (active) {
      return Err(new ConflictError('You already have an active signals subscription'))
    }
    const planDef = SIGNAL_PLAN_CATALOG[plan]
    const existingPending = await this.repo.findPendingSubscription(userId, plan)
    const subscription =
      existingPending ??
      (await this.repo.createSubscriber({
        user: { connect: { id: userId } },
        plan,
        amount: planDef.amount,
        currency: planDef.currency,
        status: 'PENDING',
        startDate: new Date(),
        endDate: new Date(Date.now() + planDef.days * 24 * 60 * 60 * 1000),
        autoRenew: true,
      }))

    const session = await paymentsService.initiateForSignalSubscription(subscription.id, userId, gateway, email)
    if (!session.success) {
      return session
    }
    return Ok({ ...session.data, subscriptionId: subscription.id })
  }
}

export const subscriberManagementService = new SubscriberManagementService()
