import { env } from '../../config/env'
import type { EmailPort } from './email.port'

interface ResendSendResponse {
  id?: string
}

export class ResendAdapter implements EmailPort {
  private apiKey = env.RESEND_API_KEY ?? ''
  private baseUrl = 'https://api.resend.com'

  async send(to: string, subject: string, body: string, options?: { html?: string; from?: string }): Promise<{ success: boolean; messageId?: string }> {
    if (!this.apiKey) {
      return { success: false }
    }
    const res = await fetch(`${this.baseUrl}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options?.from ?? 'noreply@pepnetcom.com',
        to,
        subject,
        text: body,
        html: options?.html,
      }),
    })
    const data = (await res.json()) as ResendSendResponse
    return { success: res.ok, messageId: data.id }
  }

  async sendBulk(recipients: string[], subject: string, body: string, options?: { html?: string; from?: string }): Promise<{ success: boolean; sent: number; failed: number }> {
    let sent = 0
    let failed = 0
    for (const to of recipients) {
      const result = await this.send(to, subject, body, options)
      if (result.success) sent++
      else failed++
    }
    return { success: failed === 0, sent, failed }
  }
}

export const resendAdapter = new ResendAdapter()
