import { settingsRepository } from './settings.repository'

export class GeneralSettingsService {
  constructor(private repo = settingsRepository) {}

  async get(): Promise<Record<string, any>> {
    const settings = await this.repo.findByCategory('general')
    return settings.reduce((acc, s) => { acc[s.key] = s.value; return acc }, {} as Record<string, any>)
  }

  async update(data: Record<string, any>): Promise<void> {
    await this.repo.upsertMany('general', data)
  }
}

export const generalSettingsService = new GeneralSettingsService()
