import { communicationRepository } from './communication.repository'
import { usersRepository } from '../users/users.repository'
import { addJob } from '../../jobs/queue-registry'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ValidationError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'

export class EmailBroadcastService {
  constructor(private repo = communicationRepository) {}

  async createCampaign(input: any): Promise<any> {
    return this.repo.createEmailCampaign(input)
  }

  async sendCampaign(id: string): Promise<Result<{ success: boolean; queuedRecipients: number }, NotFoundError | ValidationError>> {
    const campaign = await this.repo.findEmailCampaignById(id)
    if (!campaign) {
      return Err(new NotFoundError('Email Campaign', id))
    }
    const value = campaign.value as any
    const recipients = await usersRepository.findMany({
      where: { ...(value.recipientFilter ?? {}), status: 'ACTIVE' },
    })
    if (recipients.length === 0) {
      return Err(new ValidationError('No matching recipients for this campaign'))
    }

    await addJob('emailBroadcast', {
      campaignId: id,
      subject: value.subject,
      body: value.body,
      recipients: recipients.map((u) => u.email),
    })

    return Ok({ success: true, queuedRecipients: recipients.length })
  }
}

export const emailBroadcastService = new EmailBroadcastService()
