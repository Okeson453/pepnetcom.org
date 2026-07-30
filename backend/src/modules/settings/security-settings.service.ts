import { settingsRepository } from './settings.repository'

export class SecuritySettingsService {
  constructor(private repo = settingsRepository) {}

  async get(): Promise<Record<string, any>> {
    const settings = await this.repo.findByCategory('security')
    return settings.reduce((acc, s) => { acc[s.key] = s.value; return acc }, {} as Record<string, any>)
  }

  async update(data: Record<string, any>): Promise<void> {
    await this.repo.upsertMany('security', data)
  }
}

export const securitySettingsService = new SecuritySettingsService()
