import { env } from '../../config/env'

const REQUEST_TIMEOUT_MS = 8000

interface OneSignalNotificationResponse {
  errors?: unknown
  recipients?: number
}

export interface PushPort {
  send(userIds: string[], title: string, body: string, data?: Record<string, unknown>): Promise<{ success: boolean; sent: number }>
}

/**
 * OneSignal REST API. Targets devices via `include_external_user_ids`, which
 * assumes the client apps call `OneSignal.login(userId)` (or the older
 * `setExternalUserId`) with our own User.id at sign-in — the standard OneSignal
 * pattern for mapping your own user IDs to their device records without this
 * backend needing to store device tokens itself.
 * https://documentation.onesignal.com/reference/create-notification
 */
export class OneSignalAdapter implements PushPort {
  private appId = env.ONESIGNAL_APP_ID ?? ''
  private apiKey = env.ONESIGNAL_API_KEY ?? ''
  private baseUrl = 'https://onesignal.com/api/v1'

  async send(userIds: string[], title: string, body: string, data?: Record<string, unknown>): Promise<{ success: boolean; sent: number }> {
    if (!this.appId || !this.apiKey || userIds.length === 0) {
      return { success: false, sent: 0 }
    }
    try {
      const res = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: this.appId,
          include_external_user_ids: userIds,
          headings: { en: title },
          contents: { en: body },
          data,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
      const responseData = (await res.json()) as OneSignalNotificationResponse
      if (!res.ok || responseData.errors) {
        return { success: false, sent: 0 }
      }
      return { success: true, sent: responseData.recipients ?? userIds.length }
    } catch {
      return { success: false, sent: 0 }
    }
  }
}

export const oneSignalAdapter = new OneSignalAdapter()
