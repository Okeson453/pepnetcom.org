import { consultantRepository } from './consultant.repository'
import { universityManagementService } from './university-management.service'
import { countryManagementService } from './country-management.service'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ForbiddenError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { ConsultationRequest, StudentApplication, University, Country } from '@prisma/client'

export class ConsultantService {
  constructor(
    private repo = consultantRepository,
    private uniSvc = universityManagementService,
    private countrySvc = countryManagementService,
  ) {}

  // Consultations
  async listConsultations(input: any): Promise<{ items: ConsultationRequest[]; nextCursor?: string; hasMore: boolean }> {
    const where: any = {}
    if (input.status) where.status = input.status

    const take = (input.limit ?? 20) + 1
    const consultations = await this.repo.findConsultations({
      where,
      take,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    const hasMore = consultations.length > (input.limit ?? 20)
    const items = hasMore ? consultations.slice(0, input.limit ?? 20) : consultations
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    return { items, nextCursor, hasMore }
  }

  async createConsultation(input: any, userId: string): Promise<ConsultationRequest> {
    return this.repo.createConsultation({
      user: { connect: { id: userId } },
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      serviceType: input.serviceType,
      message: input.message,
      status: 'PENDING',
    })
  }

  async updateConsultationStatus(id: string, status: string): Promise<Result<ConsultationRequest, NotFoundError>> {
    const consultation = await this.repo.findConsultationById(id)
    if (!consultation) {
      return Err(new NotFoundError('Consultation', id))
    }
    const updated = await this.repo.updateConsultation(id, { status: status as any })
    return Ok(updated)
  }

  // Applications
  async listApplications(input: any): Promise<{ items: StudentApplication[]; nextCursor?: string; hasMore: boolean }> {
    const where: any = {}
    if (input.status) where.status = input.status

    const take = (input.limit ?? 20) + 1
    const applications = await this.repo.findApplications({
      where,
      take,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    const hasMore = applications.length > (input.limit ?? 20)
    const items = hasMore ? applications.slice(0, input.limit ?? 20) : applications
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    return { items, nextCursor, hasMore }
  }

  async getApplicationById(id: string, userId: string, userRole: string): Promise<Result<StudentApplication, NotFoundError | ForbiddenError>> {
    const application = await this.repo.findApplicationById(id)
    if (!application) {
      return Err(new NotFoundError('Application', id))
    }
    if (userRole === 'CLIENT' && application.userId !== userId) {
      return Err(new ForbiddenError())
    }
    return Ok(application)
  }

  async updateApplicationStatus(id: string, status: string): Promise<Result<StudentApplication, NotFoundError>> {
    const application = await this.repo.findApplicationById(id)
    if (!application) {
      return Err(new NotFoundError('Application', id))
    }
    const updated = await this.repo.updateApplication(id, { status: status as any })
    return Ok(updated)
  }

  // Universities
  async listUniversities(): Promise<University[]> {
    return this.uniSvc.listUniversities()
  }

  async createUniversity(input: any): Promise<Result<University, any>> {
    return this.uniSvc.createUniversity(input)
  }

  async updateUniversity(id: string, input: any): Promise<Result<University, any>> {
    return this.uniSvc.updateUniversity(id, input)
  }

  // Countries
  async listCountries(): Promise<Country[]> {
    return this.countrySvc.listCountries()
  }

  async createCountry(input: any): Promise<Result<Country, any>> {
    return this.countrySvc.createCountry(input)
  }

  async updateCountry(id: string, input: any): Promise<Result<Country, any>> {
    return this.countrySvc.updateCountry(id, input)
  }
}

export const consultantService = new ConsultantService()
