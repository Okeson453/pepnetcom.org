import { router } from './trpc'
import { authRouter } from '../modules/auth/auth.router'
import { usersRouter } from '../modules/users/users.router'
import { ordersRouter } from '../modules/orders/orders.router'
import { siwesRouter } from '../modules/siwes/siwes.router'
import { academicRouter } from '../modules/academic-services/academic.router'
import { strategiesRouter } from '../modules/trade-strategies/strategies.router'
import { consultantRouter } from '../modules/education-consultant/consultant.router'
import { marketingRouter } from '../modules/digital-marketing/marketing.router'
import { signalsRouter } from '../modules/signals/signals.router'
import { paymentsRouter } from '../modules/payments/payments.router'
import { cmsRouter } from '../modules/cms/cms.router'
import { communicationRouter } from '../modules/communication/communication.router'
import { ticketsRouter } from '../modules/support-tickets/tickets.router'
import { analyticsRouter } from '../modules/analytics/analytics.router'
import { settingsRouter } from '../modules/settings/settings.router'
import { uploadsRouter } from '../modules/uploads/uploads.router'

export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  orders: ordersRouter,
  siwes: siwesRouter,
  academic: academicRouter,
  strategies: strategiesRouter,
  consultant: consultantRouter,
  marketing: marketingRouter,
  signals: signalsRouter,
  payments: paymentsRouter,
  cms: cmsRouter,
  communication: communicationRouter,
  tickets: ticketsRouter,
  analytics: analyticsRouter,
  settings: settingsRouter,
  uploads: uploadsRouter,
})

export type AppRouter = typeof appRouter
