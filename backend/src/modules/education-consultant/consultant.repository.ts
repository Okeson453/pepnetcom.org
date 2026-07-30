import { prisma } from '../../shared/db/prisma-client'
import type { ConsultationRequest, StudentApplication, University, Country, Prisma } from '@prisma/client'

export class ConsultantRepository {
  // Consultations
  async findConsultations(params: {
    where?: Prisma.ConsultationRequestWhereInput
    take?: number
    cursor?: Prisma.ConsultationRequestWhereUniqueInput
    orderBy?: Prisma.ConsultationRequestOrderByWithRelationInput
  }): Promise<ConsultationRequest[]> {
    return prisma.consultationRequest.findMany({
      ...params,
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    })
  }

  async findConsultationById(id: string): Promise<ConsultationRequest | null> {
    return prisma.consultationRequest.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    })
  }

  async createConsultation(data: Prisma.ConsultationRequestCreateInput): Promise<ConsultationRequest> {
    return prisma.consultationRequest.create({ data })
  }

  async updateConsultation(id: string, data: Prisma.ConsultationRequestUpdateInput): Promise<ConsultationRequest> {
    return prisma.consultationRequest.update({ where: { id }, data })
  }

  // Applications
  async findApplications(params: {
    where?: Prisma.StudentApplicationWhereInput
    take?: number
    cursor?: Prisma.StudentApplicationWhereUniqueInput
    orderBy?: Prisma.StudentApplicationOrderByWithRelationInput
  }): Promise<StudentApplication[]> {
    return prisma.studentApplication.findMany({
      ...params,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        university: true,
        country: true,
      },
    })
  }

  async findApplicationById(id: string): Promise<StudentApplication | null> {
    return prisma.studentApplication.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        university: true,
        country: true,
      },
    })
  }

  async updateApplication(id: string, data: Prisma.StudentApplicationUpdateInput): Promise<StudentApplication> {
    return prisma.studentApplication.update({ where: { id }, data })
  }

  // Universities
  async findUniversities(where?: Prisma.UniversityWhereInput): Promise<University[]> {
    return prisma.university.findMany({
      where,
      include: { country: true },
      orderBy: { name: 'asc' },
    })
  }

  async findUniversityById(id: string): Promise<University | null> {
    return prisma.university.findUnique({ where: { id }, include: { country: true } })
  }

  async createUniversity(data: Prisma.UniversityCreateInput): Promise<University> {
    return prisma.university.create({ data })
  }

  async updateUniversity(id: string, data: Prisma.UniversityUpdateInput): Promise<University> {
    return prisma.university.update({ where: { id }, data })
  }

  // Countries
  async findCountries(where?: Prisma.CountryWhereInput): Promise<Country[]> {
    return prisma.country.findMany({ where, orderBy: { name: 'asc' } })
  }

  async findCountryById(id: string): Promise<Country | null> {
    return prisma.country.findUnique({ where: { id } })
  }

  async createCountry(data: Prisma.CountryCreateInput): Promise<Country> {
    return prisma.country.create({ data })
  }

  async updateCountry(id: string, data: Prisma.CountryUpdateInput): Promise<Country> {
    return prisma.country.update({ where: { id }, data })
  }
}

export const consultantRepository = new ConsultantRepository()
