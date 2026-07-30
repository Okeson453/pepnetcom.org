import { env } from '../../config/env'

const REQUEST_TIMEOUT_MS = 8000

interface TermiiSendResponse {
  code?: string
  message_id?: string
}

export interface SmsPort {
  send(to: string, message: string): Promise<{ success: boolean; messageId?: string }>
  sendBulk(recipients: string[], message: string): Promise<{ success: boolean; sent: number; failed: number }>
}

/**
 * Termii — chosen over Twilio/Africa's Talking because this codebase's payment
 * gateway config (NGN default currency, Paystack/Flutterwave as primaries) is
 * Nigeria-centric, and Termii has the best NG carrier delivery rates.
 * https://developers.termii.com/messaging
 */
export class SmsAdapter implements SmsPort {
  private apiKey = env.TERMII_API_KEY ?? ''
  private senderId = env.TERMII_SENDER_ID
  private baseUrl = 'https://api.ng.termii.com/api'

  async send(to: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    if (!this.apiKey) {
      return { success: false }
    }
    try {
      const res = await fetch(`${this.baseUrl}/sms/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: this.apiKey,
          to,
          from: this.senderId,
          sms: message,
          type: 'plain',
          channel: 'generic',
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
      const data = (await res.json()) as TermiiSendResponse
      if (!res.ok || data.code !== 'ok') {
        return { success: false }
      }
      return { success: true, messageId: data.message_id }
    } catch {
      return { success: false }
    }
  }

  async sendBulk(recipients: string[], message: string): Promise<{ success: boolean; sent: number; failed: number }> {
    if (!this.apiKey) {
      return { success: false, sent: 0, failed: recipients.length }
    }
    try {
      const res = await fetch(`${this.baseUrl}/sms/send/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: this.apiKey,
          to: recipients,
          from: this.senderId,
          sms: message,
          type: 'plain',
          channel: 'generic',
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
      const data = (await res.json()) as TermiiSendResponse
      if (!res.ok || data.code !== 'ok') {
        return { success: false, sent: 0, failed: recipients.length }
      }
      return { success: true, sent: recipients.length, failed: 0 }
    } catch {
      return { success: false, sent: 0, failed: recipients.length }
    }
  }
}

export const smsAdapter = new SmsAdapter()
