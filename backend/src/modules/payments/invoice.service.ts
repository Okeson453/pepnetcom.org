import { paymentsRepository } from './payments.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { Invoice } from '@prisma/client'
import type { TransactionClient } from '../../shared/db/transaction'
import { randomUUID } from 'crypto'

function generateInvoiceNumber(): string {
  // crypto.randomUUID() instead of Date.now()+Math.random() — collision-safe under concurrent load
  return `INV-${randomUUID()}`
}

export class InvoiceService {
  constructor(private repo = paymentsRepository) {}

  async generateInvoice(orderId: string, amount: number, currency: string, tx?: TransactionClient): Promise<Invoice> {
    const invoiceNumber = generateInvoiceNumber()
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    return this.repo.createInvoice(
      {
        order: { connect: { id: orderId } },
        invoiceNumber,
        amount,
        currency,
        status: 'ISSUED',
        dueDate,
      },
      tx,
    )
  }

  async listInvoices(userId: string, userRole: string): Promise<Invoice[]> {
    const where: any = {}
    if (userRole === 'CLIENT') {
      where.order = { clientId: userId }
    }
    return this.repo.findInvoices({
      where,
      take: 50,
      orderBy: { issuedAt: 'desc' },
    })
  }

  // Ownership check added (previously any authenticated user could fetch any
  // invoice by ID — invoices carry the same order/amount/client detail as a
  // transaction, which getTransactionById already gated by ownership; this
  // brought getInvoiceById in line with that).
  async getInvoiceById(id: string, userId: string, userRole: string): Promise<Result<Invoice, NotFoundError>> {
    const invoice = await this.repo.findInvoiceById(id)
    if (!invoice) {
      return Err(new NotFoundError('Invoice', id))
    }
    if (userRole === 'CLIENT' && (invoice as any).order?.clientId !== userId) {
      return Err(new NotFoundError('Invoice', id))
    }
    return Ok(invoice)
  }
}

export const invoiceService = new InvoiceService()
