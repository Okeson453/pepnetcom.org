import { env } from './env'

export const features = {
  enableWebSockets: env.NODE_ENV === 'production',
  enableRealTimeSignals: true,
  enableEmailBroadcasts: !!env.RESEND_API_KEY,
  enableSmsNotifications: false,
  maintenanceMode: false,
} as const
