import { describe, it, expect, vi } from 'vitest'
import { LiveChatService } from '../src/modules/communication/live-chat.service'
import { NotFoundError, ForbiddenError } from '../src/shared/errors/domain-error'

const mockCommRepo = {
  createLiveChatSession: vi.fn(),
  createTicketReply: vi.fn(),
} as any

const mockTicketsRepo = {
  findById: vi.fn(),
} as any

describe('LiveChatService.sendMessage — ticket ownership (IDOR fix)', () => {
  const service = new LiveChatService(mockCommRepo, mockTicketsRepo)

  it('rejects a message into a session/ticket that does not exist', async () => {
    mockTicketsRepo.findById.mockResolvedValue(null)
    const result = await service.sendMessage('missing', 'user-1', 'CLIENT', 'hello')
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(NotFoundError)
    expect(mockCommRepo.createTicketReply).not.toHaveBeenCalled()
  })

  it("rejects a client posting into another client's session", async () => {
    mockTicketsRepo.findById.mockResolvedValue({ id: 't1', userId: 'someone-else' })
    const result = await service.sendMessage('t1', 'attacker', 'CLIENT', 'i am in your ticket now')
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ForbiddenError)
    expect(mockCommRepo.createTicketReply).not.toHaveBeenCalled()
  })

  it('allows the session owner to send a message', async () => {
    mockTicketsRepo.findById.mockResolvedValue({ id: 't1', userId: 'user-1' })
    mockCommRepo.createTicketReply.mockResolvedValue({ id: 'r1', content: 'hi' })
    const result = await service.sendMessage('t1', 'user-1', 'CLIENT', 'hi')
    expect(result.success).toBe(true)
  })

  it('allows an admin to reply to any session', async () => {
    mockTicketsRepo.findById.mockResolvedValue({ id: 't1', userId: 'some-client' })
    mockCommRepo.createTicketReply.mockResolvedValue({ id: 'r1', content: 'support here' })
    const result = await service.sendMessage('t1', 'admin-1', 'ADMIN', 'support here')
    expect(result.success).toBe(true)
  })
})
