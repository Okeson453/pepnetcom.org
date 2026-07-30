export interface EmailPort {
  send(to: string, subject: string, body: string, options?: { html?: string; from?: string }): Promise<{ success: boolean; messageId?: string }>
  sendBulk(recipients: string[], subject: string, body: string, options?: { html?: string; from?: string }): Promise<{ success: boolean; sent: number; failed: number }>
}
