import { communicationRepository } from './communication.repository'
import type { Notification } from '@prisma/client'

export class NotificationsService {
  constructor(private repo = communicationRepository) {}

  async listNotifications(userId: string): Promise<Notification[]> {
    return this.repo.findNotifications(userId, 50)
  }

  async markRead(userId: string, ids?: string[], all = false): Promise<number> {
    if (all) {
      return this.repo.markAllNotificationsRead(userId)
    }
    if (ids && ids.length > 0) {
      return this.repo.markNotificationsRead(userId, ids)
    }
    return 0
  }

  async createNotification(userId: string, type: string, title: string, body: string, data?: any): Promise<Notification> {
    return this.repo.createNotification(userId, type, title, body, data)
  }
}

export const notificationsService = new NotificationsService()
