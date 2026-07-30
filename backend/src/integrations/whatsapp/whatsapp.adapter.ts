import { env } from '../../config/env'

const REQUEST_TIMEOUT_MS = 8000

interface WhatsAppSendResponse {
  messages?: { id: string }[]
}

export interface WhatsAppPort {
  send(to: string, message: string): Promise<{ success: boolean; messageId?: string }>
  sendTemplate(to: string, templateName: string, params: string[]): Promise<{ success: boolean; messageId?: string }>
}

/** WhatsApp Business Cloud API (Meta) — https://developers.facebook.com/docs/whatsapp/cloud-api */
export class WhatsAppAdapter implements WhatsAppPort {
  private phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID ?? ''
  private accessToken = env.WHATSAPP_ACCESS_TOKEN ?? ''
  private baseUrl = 'https://graph.facebook.com/v19.0'

  private async post(body: Record<string, unknown>): Promise<{ success: boolean; messageId?: string }> {
    if (!this.phoneNumberId || !this.accessToken) {
      return { success: false }
    }
    try {
      const res = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messaging_product: 'whatsapp', ...body }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
      const data = (await res.json()) as WhatsAppSendResponse
      if (!res.ok) {
        return { success: false }
      }
      return { success: true, messageId: data.messages?.[0]?.id }
    } catch {
      return { success: false }
    }
  }

  async send(to: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    return this.post({ to, type: 'text', text: { body: message } })
  }

  async sendTemplate(to: string, templateName: string, params: string[]): Promise<{ success: boolean; messageId?: string }> {
    return this.post({
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components: params.length
          ? [{ type: 'body', parameters: params.map((p) => ({ type: 'text', text: p })) }]
          : [],
      },
    })
  }
}

export const whatsappAdapter = new WhatsAppAdapter()
