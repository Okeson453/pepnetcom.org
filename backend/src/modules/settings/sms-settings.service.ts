import { settingsRepository } from './settings.repository'

export class SmsSettingsService {
  constructor(private repo = settingsRepository) {}

  async get(): Promise<Record<string, any>> {
    const settings = await this.repo.findByCategory('sms')
    return settings.reduce((acc, s) => { acc[s.key] = s.value; return acc }, {} as Record<string, any>)
  }

  async update(data: Record<string, any>): Promise<void> {
    await this.repo.upsertMany('sms', data)
  }
}

export const smsSettingsService = new SmsSettingsService()
